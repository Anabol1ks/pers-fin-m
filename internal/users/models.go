package users

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username         string  `gorm:"type:varchar(100);not null"`
	Email            string  `gorm:"type:varchar(100);unique;not null"`
	Password         string  `gorm:"not null"`
	Balance          float64 `gorm:"default:0"`
	Bonus            float64 `gorm:"default:0"`
	VerificationCode string
	Verified         bool `gorm:"default:false"`
}
