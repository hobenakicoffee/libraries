# Checkout Flow

The checkout is a four-step flow at `/checkout`. Cart state lives in a zustand store. URL state (step progress) is managed via `nuqs`.

## Cart store

```typescript
// app/src/stores/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  product_id:       string;
  variant_id?:      string;
  quantity:         number;
  title:            string;
  variant_label?:   string;
  cover_image_url?: string;
  unit_price:       number;
  product_type:     ShopProductType;
  cod_enabled:      boolean;
  seller_username:  string;
}

interface CartStore {
  items: CartItem[];
  notes: string;
  add: (item: CartItem) => void;
  remove: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, qty: number) => void;
  setNotes: (notes: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      notes: '',
      add: (item) => {
        const existing = get().items.find(
          (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
        );
        if (existing) {
          set({ items: get().items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
          )});
        } else {
          set({ items: [...get().items, item] });
        }
      },
      remove: (productId, variantId) =>
        set({ items: get().items.filter(
          (i) => !(i.product_id === productId && i.variant_id === variantId)
        )}),
      updateQuantity: (productId, variantId, qty) =>
        set({ items: get().items.map((i) =>
          i.product_id === productId && i.variant_id === variantId
            ? { ...i, quantity: qty } : i
        )}),
      setNotes: (notes) => set({ notes }),
      clear: () => set({ items: [], notes: '' }),
    }),
    { name: 'cart-store' }
  )
);
```

::: tip Single-seller cart
The cart assumes all items come from the same seller. When a buyer tries to add an item from a different seller, show a dialog: "Your cart has items from another shop. Replace or keep?" Mixing sellers returns `MIXED_SELLERS` from the checkout RPC.
:::

---

## Step 1 — Cart review

Renders items from the cart store. No network call needed here — everything is already in local state.

```tsx
function CartStep({ onNext }: { onNext: () => void }) {
  const { items, notes, setNotes, remove, updateQuantity } = useCartStore();
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Your cart</h2>

      {items.map((item) => (
        <CartItemRow
          key={`${item.product_id}-${item.variant_id}`}
          item={item}
          onRemove={() => remove(item.product_id, item.variant_id)}
          onQuantityChange={(qty) => updateQuantity(item.product_id, item.variant_id, qty)}
        />
      ))}

      <Separator />

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a note for the seller (optional)"
        rows={3}
      />

      <div className="flex justify-between font-medium text-lg">
        <span>Subtotal</span>
        <span>৳{subtotal.toLocaleString()}</span>
      </div>
      <p className="text-sm text-muted-foreground">Shipping calculated at next step.</p>

      <Button onClick={onNext} className="w-full">Continue →</Button>
    </div>
  );
}
```

---

## Step 2 — Address

Only shown when the cart has physical items. Digital-only carts skip straight to payment.

```tsx
function AddressStep({ onNext }: { onNext: (addressId: string | null) => void }) {
  const cart = useCartStore();
  const hasPhysical = cart.items.some((i) => i.product_type === 'physical');

  useEffect(() => {
    if (!hasPhysical) onNext(null);   // skip for digital-only carts
  }, [hasPhysical, onNext]);

  const { data: addresses } = useQuery({
    queryKey: ['user', 'addresses'],
    queryFn: getUserAddresses,
  });

  const [selectedId, setSelectedId] = useState<string | null>(
    addresses?.find((a) => a.is_default)?.id ?? null
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Delivery address</h2>

      <RadioGroup value={selectedId ?? ''} onValueChange={setSelectedId} className="space-y-2">
        {addresses?.map((addr) => (
          <label key={addr.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
            <RadioGroupItem value={addr.id} className="mt-1" />
            <div>
              {addr.label && <div className="font-medium text-sm">{addr.label}</div>}
              <div className="text-sm">{addr.recipient_name} · {addr.phone}</div>
              <div className="text-sm text-muted-foreground">
                {addr.address_line1}, {addr.city}, {addr.district}
              </div>
            </div>
          </label>
        ))}
      </RadioGroup>

      <Button variant="outline" onClick={() => setNewAddressOpen(true)}>
        + Add new address
      </Button>

      <Button
        disabled={!selectedId}
        onClick={() => onNext(selectedId)}
        className="w-full"
      >
        Continue →
      </Button>
    </div>
  );
}
```

---

## Step 3 — Payment method

```tsx
function PaymentStep({ onPay }: { onPay: (method: ShopPaymentMethod) => void }) {
  const cart = useCartStore();
  const hasDigital = cart.items.some((i) => i.product_type === 'digital');
  const allCodEnabled = cart.items.every((i) => i.cod_enabled);
  const codAvailable = !hasDigital && allCodEnabled;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Payment method</h2>

      <PaymentOption
        id="online"
        label="Pay online"
        description="Card, mobile banking, or wallet — processed via SSLCommerz"
        onClick={() => onPay('online')}
      />

      <PaymentOption
        id="cod"
        label="Cash on delivery"
        description={
          !codAvailable
            ? hasDigital
              ? "Not available — digital products must be paid online"
              : "Not available — some items in your cart don't support COD"
            : "Pay with cash when your order arrives"
        }
        disabled={!codAvailable}
        onClick={() => onPay('cod')}
      />
    </div>
  );
}
```

---

## Step 4 — Order submission

```tsx
async function placeOrder(method: ShopPaymentMethod, addressId: string | null) {
  const cart = useCartStore.getState();

  try {
    const result = await initiateShopCheckout({
      items: cart.items.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity:   i.quantity,
      })),
      address_id:     addressId ?? undefined,
      buyer_notes:    cart.notes || undefined,
      payment_method: method,
    });

    if (method === 'online') {
      // Initiate SSLCommerz session with result.total
      const session = await initiatePaymentSession({
        order_number: result.order_number,
        amount:       result.total,
      });
      window.location.href = session.gateway_url;   // redirect to gateway
    } else {
      // COD: order is in 'processing' — no gateway needed
      cart.clear();
      navigate(`/orders/${result.order_number}?placed=cod`);
    }
  } catch (err) {
    handleCheckoutError(err);
  }
}
```

---

## Checkout error handling

Map every known error code to buyer-friendly copy:

```typescript
const CHECKOUT_ERROR_COPY: Partial<Record<string, string>> = {
  EMPTY_CART:                  'Your cart is empty.',
  PRODUCT_NOT_FOUND:           'A product in your cart is no longer available. Please remove it and try again.',
  VARIANT_NOT_FOUND:           'A variant you selected is no longer available.',
  INSUFFICIENT_STOCK:          'One or more items in your cart are out of stock.',
  MIXED_SELLERS:               'Your cart has items from different shops. Please checkout separately.',
  CANNOT_BUY_OWN_PRODUCT:      "You can't buy your own products.",
  SHIPPING_ADDRESS_REQUIRED:   'Please select a delivery address.',
  ADDRESS_NOT_FOUND:           "We couldn't find that address. Please select another.",
  COD_NOT_ALLOWED_FOR_DIGITAL: 'Digital products must be paid online. Please select online payment.',
  MIXED_COD_AND_NON_COD:       "Some items in your cart don't support cash on delivery. Try paying online instead.",
  SELLER_COD_BLOCKED:          "This shop isn't accepting cash on delivery right now. Please pay online.",
};

function handleCheckoutError(err: unknown) {
  if (err instanceof ShopError) {
    const copy = CHECKOUT_ERROR_COPY[err.code];
    toast.error(copy ?? `Checkout failed: ${err.code}`);
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

---

## Shipping preview

After address selection, show estimated shipping fees before the payment step. This requires product detail for the shipping tier — either cache it in the cart store on `add()` or fetch the product map here.

```typescript
function estimatedShipping(items: CartItem[], address: UserAddress, productMap: Map<string, ShopProductDetail>): number {
  return items.reduce((total, item) => {
    if (item.product_type !== 'physical') return total;
    const product = productMap.get(item.product_id);
    if (!product) return total;
    const insideDhaka = address.district.toLowerCase() === 'dhaka';
    const fee = insideDhaka
      ? product.shipping_fee_inside_dhaka
      : product.shipping_fee_outside_dhaka;
    return total + fee * item.quantity;
  }, 0);
}
```

The best approach is to store `shipping_fee_inside_dhaka` and `shipping_fee_outside_dhaka` in the cart item when the buyer clicks "Add to cart" (you already have product detail at that point). Then the estimate is pure local computation.
