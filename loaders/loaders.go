// Package loaders defines the per-route data loaders for Yatra Tents.
// Each loader returns the props that the matching page template will receive.
// Add a new page → add a loader here, register it in All().
package loaders

import (
	"net/http"

	"github.com/salmanfaris22/nexgo/v2/pkg/renderer"

	"yatra-tents/models"
	"yatra-tents/seo"
)

// All returns the full route → loader map.
// main.go iterates this and calls srv.RegisterDataLoader for each entry.
// Each loader attaches page-specific rich JSON-LD via "pageSchemas".
func All() map[string]renderer.DataLoader {
	stats := models.DefaultStats()

	return map[string]renderer.DataLoader{
		"/": func(r *http.Request, p map[string]string) (map[string]interface{}, error) {
			return seo.Wrap("Home",
				"Affordable tent and camping equipment rentals across Kerala. Strangers camp, travel gear, guided trips with Yatra Tents.",
				map[string]interface{}{
					"tents":  models.FeaturedTents(),
					"gear":   models.FeaturedGear(),
					"events": models.UpcomingEvents(),
					"stats": map[string]interface{}{
						"posts":     stats.Posts,
						"followers": stats.Followers,
						"following": stats.Following,
						"trips":     stats.Trips,
					},
					"pageSchemas": seo.HomeSchemas(),
				}), nil
		},

		"/tents": func(r *http.Request, p map[string]string) (map[string]interface{}, error) {
			tents := models.AllTents()
			gear := models.AllGear()
			return seo.Wrap("Tents & Gear",
				"Browse all tents and camping gear available for rent at Yatra Tents. Daily rental from ₹70/day across Kerala.",
				map[string]interface{}{
					"tents":       tents,
					"gear":        gear,
					"pageSchemas": seo.TentsSchemas(tents, gear),
				}), nil
		},

		"/events": func(r *http.Request, p map[string]string) (map[string]interface{}, error) {
			events := models.UpcomingEvents()
			return seo.Wrap("Upcoming Events",
				"Join Yatra Tents on upcoming strangers camps, treks and backwater experiences across Kerala. Book online.",
				map[string]interface{}{
					"events":      events,
					"pageSchemas": seo.EventsSchemas(events),
				}), nil
		},

		"/about": func(r *http.Request, p map[string]string) (map[string]interface{}, error) {
			return seo.Wrap("About Yatra Tents",
				"The story behind Yatra Tents — Kerala's friendly tent and camping rental community with 8,000+ followers.",
				map[string]interface{}{"pageSchemas": seo.AboutSchemas()}), nil
		},

		"/gallery": func(r *http.Request, p map[string]string) (map[string]interface{}, error) {
			return seo.Wrap("Gallery",
				"Photos and reels from Yatra Tents trips. Follow @yatra.tents on Instagram for daily updates.",
				nil), nil
		},

		"/contact": func(r *http.Request, p map[string]string) (map[string]interface{}, error) {
			return seo.Wrap("Contact",
				"Get in touch with Yatra Tents. WhatsApp +91-99999-99999 or email hello@yatratents.in to book a tent or plan a trip.",
				map[string]interface{}{"pageSchemas": seo.ContactSchemas()}), nil
		},
	}
}
