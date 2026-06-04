package models

import (
	"time"
)

type Registration struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	EventID       uint64     `gorm:"not null" json:"event_id"`
	UserID        uint64     `gorm:"not null" json:"user_id"`
	Displacement  int        `json:"displacement"`
	LicenseLevel  string     `gorm:"size:20" json:"license_level"`
	Status        string     `gorm:"size:20;default:'pending'" json:"status"`
	ReviewNote    string     `gorm:"size:500" json:"review_note"`
	ReviewedBy    *uint64    `json:"reviewed_by"`
	ReviewedAt    *time.Time `json:"reviewed_at"`
	CreatedAt     time.Time  `json:"created_at"`
	User          *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Event         *Event     `gorm:"foreignKey:EventID" json:"event,omitempty"`
}

func (Registration) TableName() string {
	return "registrations"
}
