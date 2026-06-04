package models

import (
	"time"
)

type Review struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	EventID       uint64    `gorm:"not null" json:"event_id"`
	UserID        uint64    `gorm:"not null" json:"user_id"`
	TotalDistance float64   `gorm:"type:decimal(10,2)" json:"total_distance"`
	MaxSpeed      float64   `gorm:"type:decimal(10,2)" json:"max_speed"`
	AvgSpeed      float64   `gorm:"type:decimal(10,2)" json:"avg_speed"`
	RideDuration  int       `json:"ride_duration"`
	Content       string    `gorm:"type:text" json:"content"`
	CreatedAt     time.Time `json:"created_at"`
	User          *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Review) TableName() string {
	return "reviews"
}

type Media struct {
	ID         uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ReviewID   uint64     `gorm:"not null" json:"review_id"`
	EventID    uint64     `gorm:"not null" json:"event_id"`
	UserID     uint64     `gorm:"not null" json:"user_id"`
	MediaType  string     `gorm:"size:10;not null" json:"media_type"`
	FilePath   string     `gorm:"size:255;not null" json:"file_path"`
	FileSize   int64      `json:"file_size"`
	Lat        *float64   `gorm:"type:decimal(10,7)" json:"lat"`
	Lng        *float64   `gorm:"type:decimal(10,7)" json:"lng"`
	CapturedAt *time.Time `json:"captured_at"`
	CreatedAt  time.Time  `json:"created_at"`
}

func (Media) TableName() string {
	return "media"
}

type TrackPoint struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ReviewID   uint64    `gorm:"not null" json:"review_id"`
	UserID     uint64    `gorm:"not null" json:"user_id"`
	EventID    uint64    `gorm:"not null" json:"event_id"`
	Lat        float64   `gorm:"type:decimal(10,7);not null" json:"lat"`
	Lng        float64   `gorm:"type:decimal(10,7);not null" json:"lng"`
	Elevation  *float64  `gorm:"type:decimal(10,2)" json:"elevation"`
	Speed      *float64  `gorm:"type:decimal(10,2)" json:"speed"`
	RecordedAt time.Time `gorm:"not null" json:"recorded_at"`
}

func (TrackPoint) TableName() string {
	return "track_points"
}
