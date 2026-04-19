// Package models holds the domain types and seed data for Yatra Tents.
// Keeping these out of main.go makes it easy to swap in a real database
// later without touching the server bootstrap.
package models

type Tent struct {
	ID, Name, NameML, Capacity, Price, Icon, Color, Description, DescriptionML string
	Featured                                                                   bool
}

type Gear struct {
	ID, Name, NameML, Price, Icon, Description, DescriptionML string
}

type Event struct {
	ID, Title, TitleML, Date, Location, LocationML, Icon, Spots, Description, DescriptionML string
}

type Stats struct {
	Posts, Followers, Following, Trips int
}

func DefaultStats() Stats {
	return Stats{Posts: 284, Followers: 8198, Following: 2297, Trips: 50}
}
