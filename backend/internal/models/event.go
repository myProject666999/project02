package models

import (
	"time"
)

type Event struct {
	ID                 uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CreatorID          uint64    `gorm:"not null" json:"creator_id"`
	Title              string    `gorm:"size:200;not null" json:"title"`
	Description        string    `gorm:"type:text" json:"description"`
	StartPoint         string    `gorm:"size:200;not null" json:"start_point"`
	StartLat           float64   `gorm:"type:decimal(10,7)" json:"start_lat"`
	StartLng           float64   `gorm:"type:decimal(10,7)" json:"start_lng"`
	EndPoint           string    `gorm:"size:200;not null" json:"end_point"`
	EndLat             float64   `gorm:"type:decimal(10,7)" json:"end_lat"`
	EndLng             float64   `gorm:"type:decimal(10,7)" json:"end_lng"`
	MeetTime           time.Time `gorm:"not null" json:"meet_time"`
	RouteGPXPath       string    `gorm:"size:255" json:"route_gpx_path"`
	RouteDescription   string    `gorm:"type:text" json:"route_description"`
	MinDisplacement    int       `gorm:"default:0" json:"min_displacement"`
	RequireLicenseLevel string    `gorm:"size:10" json:"require_license_level"`
	MaxParticipants    int       `gorm:"default:20" json:"max_participants"`
	CheckinRadius      int       `gorm:"default:200" json:"checkin_radius"`
	Status             string    `gorm:"size:20;default:'pending'" json:"status"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	Creator            *User     `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
}

func (Event) TableName() string {
	return "events"
}
