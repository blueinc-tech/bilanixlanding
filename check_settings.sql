SELECT key, length(value::text) as len, value::text FROM system_settings WHERE "group" = 'paystack';
