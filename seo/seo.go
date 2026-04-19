// Package seo centralises SEO-related helpers for Yatra Tents.
//
// The layout reads .Props.title and .Props.description and feeds them
// to the seoMeta template helper. Wrap merges those fields into any
// existing props map so each loader can stay terse:
//
//	return seo.Wrap("Tents & Gear", "Browse all tents…", map[string]any{
//	    "tents": models.AllTents(),
//	}), nil
package seo

// Wrap merges page-level SEO fields (title + description) into a props map.
// Pass nil if you have no other props.
func Wrap(title, description string, props map[string]interface{}) map[string]interface{} {
	if props == nil {
		props = make(map[string]interface{})
	}
	props["title"] = title
	props["description"] = description
	return props
}

// Keywords returns the SEO keywords for the site. Used in tests / future
// programmatic injection.
func Keywords() []string {
	return []string{
		"tent rental kerala",
		"camping kerala",
		"wayanad camping",
		"munnar trek",
		"strangers camp",
		"camping equipment rental",
		"kerala adventure",
		"യാത്ര",
		"ടെന്റ് വാടക",
	}
}
