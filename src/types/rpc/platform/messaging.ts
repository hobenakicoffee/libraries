export type AutoReplyHourRow = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type GetAutoReplySettingsResult = {
  enabled: boolean;
  reply_message: string;
  timezone: string;
  manual_away: boolean;
  manual_away_until: string | null;
  hours: AutoReplyHourRow[];
};

export type MessagingOverrides = {
  get_auto_reply_settings: GetAutoReplySettingsResult;
};
