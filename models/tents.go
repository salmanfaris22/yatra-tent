package models

func FeaturedTents() []Tent { t := AllTents(); return t[:3] }

func AllTents() []Tent {
	return []Tent{
		{"t1", "Wanderer 2P", "സഞ്ചാരി 2P", "2 Person", "₹450/day", "🏕️", "#2D5F3F",
			"Lightweight backpacking tent for solo travellers and couples.",
			"സോളോ യാത്രികർക്കും ദമ്പതിമാർക്കും അനുയോജ്യമായ ഭാരം കുറഞ്ഞ ടെന്റ്.", true},
		{"t2", "Forest Dome 4P", "വന ഡോം 4P", "4 Person", "₹750/day", "⛺", "#E8A530",
			"Spacious dome tent perfect for family weekend camps.",
			"കുടുംബ വാരാന്ത്യ ക്യാമ്പുകൾക്ക് അനുയോജ്യമായ വിശാലമായ ഡോം ടെന്റ്.", true},
		{"t3", "Highland 6P", "ഹൈലാൻഡ് 6P", "6 Person", "₹1100/day", "🏔️", "#2D5F3F",
			"Heavy-duty tent built for monsoon and high altitude camping.",
			"മൺസൂൺ, ഉയർന്ന പ്രദേശ ക്യാമ്പിംഗിന് ശക്തമായ ടെന്റ്.", true},
		{"t4", "Coastal Breeze 3P", "തീരക്കാറ്റ് 3P", "3 Person", "₹600/day", "🌊", "#E8A530",
			"Quick-pitch beach tent with UV protection.",
			"UV സംരക്ഷണമുള്ള വേഗത്തിൽ സ്ഥാപിക്കാവുന്ന ബീച്ച് ടെന്റ്.", false},
		{"t5", "Trekker Mini 1P", "ട്രെക്കർ മിനി 1P", "1 Person", "₹300/day", "🥾", "#2D5F3F",
			"Ultralight one-person bivy tent for serious trekkers.",
			"ഗൗരവമേറിയ ട്രെക്കർമാർക്കുള്ള അൾട്രാലൈറ്റ് ഒറ്റയാൾ ടെന്റ്.", false},
		{"t6", "Family Cabin 8P", "ഫാമിലി ക്യാബിൻ 8P", "8 Person", "₹1500/day", "🏠", "#E8A530",
			"Two-room cabin tent for large groups and family trips.",
			"വലിയ ഗ്രൂപ്പുകൾക്കും കുടുംബ യാത്രകൾക്കും രണ്ട് മുറി ക്യാബിൻ ടെന്റ്.", false},
	}
}
