package utils

import (
	"database/sql/driver"
	"errors"
	"time"
)

type DateTime struct {
	time.Time
}

var datetimeFormats = []string{
	"2006-01-02T15:04:05Z07:00",
	"2006-01-02T15:04:05",
	"2006-01-02 15:04:05",
	"2006-01-02T15:04:05.000Z",
	time.RFC3339Nano,
}

func (dt *DateTime) UnmarshalJSON(data []byte) error {
	if len(data) == 0 || string(data) == "null" {
		dt.Time = time.Time{}
		return nil
	}

	s := string(data)
	if len(s) >= 2 && s[0] == '"' && s[len(s)-1] == '"' {
		s = s[1 : len(s)-1]
	}

	for _, format := range datetimeFormats {
		if t, err := time.ParseInLocation(format, s, time.Local); err == nil {
			dt.Time = t
			return nil
		}
	}

	return errors.New("无法解析时间格式: " + s)
}

func (dt DateTime) MarshalJSON() ([]byte, error) {
	if dt.Time.IsZero() {
		return []byte("null"), nil
	}
	return []byte(`"` + dt.Time.Format("2006-01-02T15:04:05Z07:00") + `"`), nil
}

func (dt DateTime) Value() (driver.Value, error) {
	if dt.Time.IsZero() {
		return nil, nil
	}
	return dt.Time, nil
}

func (dt *DateTime) Scan(value interface{}) error {
	if value == nil {
		dt.Time = time.Time{}
		return nil
	}
	switch v := value.(type) {
	case time.Time:
		dt.Time = v
		return nil
	}
	return errors.New("无法扫描时间类型")
}
