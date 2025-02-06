package transactions

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model
	UserID      uint      `gorm:"not null"`
	Amount      int       `gorm:"not null"`
	BonusChange float64   `gorm:"default:0"`
	Currency    string    `gorm:"type:varchar(10);default:'RUB'"`
	Date        time.Time `gorm:"not null"`
	Title       string    `gorm:"type:varchar(100);not null"`
	Description string    `gorm:"type:text"`
	Category    uint      `gorm:"not null"`
}
