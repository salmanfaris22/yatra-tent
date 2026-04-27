// Yatra Tents — NexGo entry point.
//
// Everything domain-specific lives in dedicated packages:
//
//	models/   — tent, gear, event types and seed data
//	loaders/  — per-route data loaders (the props each page receives)
//	seo/      — SEO helpers shared by every loader
//	pages/api — HTTP API handlers (auto-imported below)
//
// main.go's only job is to load the config, build the server, register
// the loaders, and start serving.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"

	"github.com/salmanfaris22/nexgo/v2/pkg/config"
	"github.com/salmanfaris22/nexgo/v2/pkg/server"
	// Side-effect import: pages/api/*.go register API handlers in init(

	"yatra-tents/loaders"
	"yatra-tents/models"
	"yatra-tents/seo"
	// Side-effect import: pages/api/*.go register API handlers in init().
	_ "yatra-tents/pages/api"
)

func main() {
	cfg, err := config.Load(".")
	if err != nil {
		log.Fatal(err)
	}

	srv, err := server.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	for route, loader := range loaders.All() {
		srv.RegisterDataLoader(route, loader)
	}

	// RSS feed for upcoming events (uses NexGo's seo.RenderRSS under the hood)
	srv.RegisterRoute("/rss.xml", func(w http.ResponseWriter, r *http.Request) {
		xml, err := seo.EventsRSSFeed(models.UpcomingEvents())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/rss+xml; charset=utf-8")
		w.Header().Set("Cache-Control", "public, max-age=3600")
		_, _ = w.Write(xml)
	})

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	log.Println("[Yatra Tents] Starting NexGo server...")
	if err := srv.Start(ctx); err != nil {
		log.Fatal(err)
	}
}
