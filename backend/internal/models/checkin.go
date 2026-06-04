package models

import (
	"time"
)

type Checkin struct {
	ID                uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	EventID           uint64    `gorm:"not null" json:"event_id"`
	UserID            uint64    `gorm:"not null" json:"user_id"`
	Lat               float64   `gorm:"type:decimal(10,7);not null" json:"lat"`
	Lng               float64   `gorm:"type:decimal(10,7);not null" json:"lng"`
	DistanceFromStart float64   `gorm:"type:decimal(10,2)" json:"distance_from_start"`
	IsValid           bool      `gorm:"default:true" json:"is_valid"`
	CheckinTime       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"checkin_time"`
	User              *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Checkin) TableName() string {
	return "checkins"
}
