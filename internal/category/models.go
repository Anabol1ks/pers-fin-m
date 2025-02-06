package сategory

import "time"

type Category struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"not null"`
	UserID    *uint  // nil для дефолтных категорий
	CreatedAt time.Time
	UpdatedAt time.Time
}
