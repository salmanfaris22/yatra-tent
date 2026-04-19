package seo

import (
	"fmt"
	"strings"
	"time"

	nexseo "github.com/salmanfaris22/nexgo/v2/pkg/seo"

	"yatra-tents/models"
)

const (
	siteURL = "https://yatratents.in"
	siteImg = "https://yatratents.in/static/images/logo.jpg"
)

// HomeSchemas returns rich JSON-LD for the landing page:
//   - Service (tent rental business)
//   - AggregateRating from testimonials
//   - 5 Review entries
func HomeSchemas() string {
	var b strings.Builder

	// Service offered
	b.WriteString(string(nexseo.JSONLD(map[string]interface{}{
		"@context":    "https://schema.org",
		"@type":       "Service",
		"name":        "Tent and Camping Equipment Rental",
		"provider":    map[string]interface{}{"@type": "Organization", "name": "Yatra Tents", "url": siteURL},
		"areaServed":  map[string]interface{}{"@type": "State", "name": "Kerala, India"},
		"description": "Daily rentals of tents, sleeping bags, lanterns and trekking gear, plus organised strangers camps and guided trips across Kerala.",
		"offers": map[string]interface{}{
			"@type":         "Offer",
			"priceCurrency": "INR",
			"priceRange":    "₹70 - ₹1500 per day",
		},
	})))

	// Aggregate rating + individual reviews (matches the testimonials marquee on /)
	reviews := []map[string]interface{}{
		{"author": "Anjali", "rating": 5, "body": "The Wayanad camp completely changed my idea of weekend trips. The tent was spotless."},
		{"author": "Rahul", "rating": 5, "body": "Came alone to the Munnar trek and left with six new friends."},
		{"author": "Sneha", "rating": 5, "body": "Pickup was on time and the kit was easy to set up — even the kids managed."},
		{"author": "Akhil", "rating": 5, "body": "Cleanest gear I have used in any rental in Kerala."},
		{"author": "Meera", "rating": 5, "body": "The strangers camp was the best money I have spent this year."},
	}
	reviewObjs := make([]map[string]interface{}, 0, len(reviews))
	for _, r := range reviews {
		reviewObjs = append(reviewObjs, map[string]interface{}{
			"@type":        "Review",
			"author":       map[string]interface{}{"@type": "Person", "name": r["author"]},
			"reviewRating": map[string]interface{}{"@type": "Rating", "ratingValue": r["rating"], "bestRating": 5},
			"reviewBody":   r["body"],
		})
	}
	b.WriteString(string(nexseo.JSONLD(map[string]interface{}{
		"@context": "https://schema.org",
		"@type":    "Product",
		"name":     "Yatra Tents Camping Rentals",
		"image":    siteImg,
		"description": "Tent and camping gear rentals plus guided trips across Kerala.",
		"brand":    map[string]interface{}{"@type": "Brand", "name": "Yatra Tents"},
		"aggregateRating": map[string]interface{}{
			"@type":       "AggregateRating",
			"ratingValue": "5",
			"reviewCount": len(reviews),
			"bestRating":  5,
		},
		"review": reviewObjs,
	})))

	return b.String()
}

// TentsSchemas returns ItemList + per-tent Product schemas for the /tents page.
func TentsSchemas(tents []models.Tent, gear []models.Gear) string {
	var b strings.Builder

	// ItemList of tents
	items := make([]map[string]interface{}, 0, len(tents))
	for i, t := range tents {
		items = append(items, map[string]interface{}{
			"@type":    "ListItem",
			"position": i + 1,
			"name":     t.Name,
		})
	}
	b.WriteString(string(nexseo.JSONLD(map[string]interface{}{
		"@context":        "https://schema.org",
		"@type":           "ItemList",
		"name":            "Tent Rentals",
		"itemListElement": items,
	})))

	// One Product schema per tent
	for _, t := range tents {
		b.WriteString(string(nexseo.ProductSchema(nexseo.ProductSchemaInput{
			Name:        t.Name,
			Description: t.Description,
			Image:       siteImg,
			Brand:       "Yatra Tents",
			SKU:         t.ID,
			Price:       t.Price,
			Currency:    "INR",
			Availability: "InStock",
		})))
	}

	// One Product schema per gear item
	for _, g := range gear {
		b.WriteString(string(nexseo.ProductSchema(nexseo.ProductSchemaInput{
			Name:         g.Name,
			Description:  g.Description,
			Image:        siteImg,
			Brand:        "Yatra Tents",
			SKU:          g.ID,
			Price:        g.Price,
			Currency:     "INR",
			Availability: "InStock",
		})))
	}

	return b.String()
}

// EventsSchemas returns Event JSON-LD for each upcoming trip on /events.
func EventsSchemas(events []models.Event) string {
	var b strings.Builder
	for _, e := range events {
		startDate := parseEventDate(e.Date)
		b.WriteString(string(nexseo.JSONLD(map[string]interface{}{
			"@context":            "https://schema.org",
			"@type":               "Event",
			"name":                e.Title,
			"description":         e.Description,
			"startDate":           startDate,
			"eventStatus":         "https://schema.org/EventScheduled",
			"eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
			"location": map[string]interface{}{
				"@type": "Place",
				"name":  e.Location,
				"address": map[string]interface{}{
					"@type":           "PostalAddress",
					"addressLocality": e.Location,
					"addressRegion":   "Kerala",
					"addressCountry":  "IN",
				},
			},
			"image": siteImg,
			"organizer": map[string]interface{}{
				"@type": "Organization",
				"name":  "Yatra Tents",
				"url":   siteURL,
			},
			"offers": map[string]interface{}{
				"@type":         "Offer",
				"availability":  "https://schema.org/InStock",
				"priceCurrency": "INR",
				"price":         "1500",
				"url":           siteURL + "/events#event-" + strings.ToLower(e.Location),
			},
		})))
	}
	return b.String()
}

// AboutSchemas adds a HowTo schema describing how to book a Yatra Tents trip.
func AboutSchemas() string {
	return string(nexseo.HowToSchema(
		"How to book with Yatra Tents",
		"Three steps to rent a tent or join a camp.",
		[]nexseo.HowToStep{
			{Name: "Pick a date", Text: "Browse tents and upcoming events, pick the dates and group size that work for you."},
			{Name: "Tell us via WhatsApp", Text: "Send your name, contact and trip details. We confirm availability within an hour."},
			{Name: "Pickup or delivery", Text: "Collect your gear from our Kochi store, or get it delivered to your door."},
		},
	))
}

// ContactSchemas adds LocalBusiness with full contact info on /contact.
func ContactSchemas() string {
	return string(nexseo.LocalBusinessSchema(
		"Yatra Tents",
		siteURL,
		"+91-99999-99999",
		"MG Road",
		"Kochi",
		"Kerala",
		"682016",
		"IN",
	))
}

// parseEventDate converts "May 03, 2026" → "2026-05-03".
func parseEventDate(s string) string {
	t, err := time.Parse("Jan 02, 2006", s)
	if err != nil {
		return s
	}
	return t.Format("2006-01-02")
}

// EventsRSSFeed builds an RSS feed of upcoming events using NexGo's RenderRSS.
func EventsRSSFeed(events []models.Event) ([]byte, error) {
	feed := nexseo.Feed{
		Title:       "Yatra Tents — Upcoming trips",
		Link:        siteURL + "/events",
		Description: "Upcoming strangers camps, treks and backwater experiences across Kerala.",
		Language:    "en-IN",
	}
	for _, e := range events {
		startDate, _ := time.Parse("Jan 02, 2006", e.Date)
		feed.Items = append(feed.Items, nexseo.FeedItem{
			Title:       e.Title,
			Link:        fmt.Sprintf("%s/events#event-%s", siteURL, strings.ToLower(e.Location)),
			Description: e.Description,
			GUID:        e.ID,
			PubDate:     startDate,
			Categories:  []string{"camping", "kerala", "travel"},
		})
	}
	return nexseo.RenderRSS(feed)
}
