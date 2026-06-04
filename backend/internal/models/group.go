package models

import (
	"time"
)

type Group struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	EventID    uint64    `gorm:"not null" json:"event_id"`
	GroupName  string    `gorm:"size:50;not null" json:"group_name"`
	GroupLevel string    `gorm:"size:10;not null" json:"group_level"`
	LeaderID   *uint64   `json:"leader_id"`
	CreatedAt  time.Time `json:"created_at"`
	Leader     *User     `gorm:"foreignKey:LeaderID" json:"leader,omitempty"`
}

func (Group) TableName() string {
	return "groups"
}

type GroupMember struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	GroupID   uint64    `gorm:"not null" json:"group_id"`
	UserID    uint64    `gorm:"not null" json:"user_id"`
	EventID   uint64    `gorm:"not null" json:"event_id"`
	JoinedAt  time.Time `json:"joined_at"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Group     *Group    `gorm:"foreignKey:GroupID" json:"group,omitempty"`
}

func (GroupMember) TableName() string {
	return "group_members"
}
