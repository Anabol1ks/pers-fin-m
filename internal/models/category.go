package models

import "time"

type Category struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"not null"`
	UserID    *uint  // nil для дефолтных категорий
	Color     string `gorm:"type:text;not null;default:'#16a34a'"`
	IsDefault bool   `gorm:"not null;default:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
