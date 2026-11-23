// Pazaro BD — Complete Demo Seed Data (Bangladesh Market, Prices in ৳)
import { LOCAL_PHOTOS, makeProductSvg } from "/src/js/product-art.js";
export const SEED_CATEGORIES = [
	{
		id: "cat-phones",
		name: "Phones",
		nameBn: "ফোন",
		icon: "📱",
		imageUrl: "",
		sortOrder: 1
	},
	{
		id: "cat-laptops",
		name: "Laptops",
		nameBn: "ল্যাপটপ",
		icon: "💻",
		imageUrl: "",
		sortOrder: 2
	},
	{
		id: "cat-headphones",
		name: "Headphones",
		nameBn: "হেডফোন",
		icon: "🎧",
		imageUrl: "",
		sortOrder: 3
	},
	{
		id: "cat-smart-watches",
		name: "Smart Watches",
		nameBn: "স্মার্ট ওয়াচ",
		icon: "⌚",
		imageUrl: "",
		sortOrder: 4
	},
	{
		id: "cat-gaming",
		name: "Gaming",
		nameBn: "গেমিং",
		icon: "🎮",
		imageUrl: "",
		sortOrder: 5
	},
	{
		id: "cat-accessories",
		name: "Accessories",
		nameBn: "এক্সেসরিজ",
		icon: "🔋",
		imageUrl: "",
		sortOrder: 6
	},
	{
		id: "cat-smart-home",
		name: "Smart Home",
		nameBn: "স্মার্ট হোম",
		icon: "🏠",
		imageUrl: "",
		sortOrder: 7
	},
	{
		id: "cat-fashion",
		name: "Fashion",
		nameBn: "ফ্যাশন",
		icon: "👕",
		imageUrl: "",
		sortOrder: 8
	},
	{
		id: "cat-beauty",
		name: "Beauty & Skincare",
		nameBn: "বিউটি, স্কিনকেয়ার ও সিরাম",
		icon: "🧴",
		imageUrl: "",
		sortOrder: 9
	},
	{
		id: "cat-home-living",
		name: "Home and Living",
		nameBn: "হোম ও লিভিং",
		icon: "🪴",
		imageUrl: "",
		sortOrder: 10
	},
	{
		id: "cat-sports",
		name: "Sports",
		nameBn: "স্পোর্টস",
		icon: "🏋️",
		imageUrl: "",
		sortOrder: 11
	},
	{
		id: "cat-toys-kids",
		name: "Toys and Kids",
		nameBn: "খেলনা ও শিশু",
		icon: "🧸",
		imageUrl: "",
		sortOrder: 12
	},
	{
		id: "cat-books",
		name: "Books",
		nameBn: "বই",
		icon: "📚",
		imageUrl: "",
		sortOrder: 13
	},
	{
		id: "cat-groceries",
		name: "Groceries",
		nameBn: "মুদি সামগ্রী",
		icon: "🍯",
		imageUrl: "",
		sortOrder: 14
	}
];
export const SEED_PRODUCTS = [
	{
		id: "prod-redmi-note-13",
		name: "Redmi Note 13 (8GB/128GB)",
		slug: "redmi-note-13-8gb-128gb",
		brand: "Xiaomi",
		category: "Phones",
		price: 21500,
		oldPrice: 24e3,
		stock: 28,
		unitsSold: 64,
		sku: "PZ-PH-101",
		rating: 4.8,
		reviewCount: 142,
		shortDescription: "120Hz AMOLED display, 108MP triple camera, Snapdragon processor & 33W fast charging.",
		fullDescription: "Experience flagship-grade clarity with the Redmi Note 13 featuring a vivid 6.67-inch 120Hz AMOLED screen, 108MP ultra-clear main camera, and a long-lasting 5000mAh battery engineered for all-day performance across Bangladesh.",
		features: [
			"6.67\" 120Hz FHD+ AMOLED Display",
			"108MP Pro-Grade Main Camera",
			"Snapdragon 685 Octa-Core Processor",
			"5000mAh Battery with 33W Turbo Charge",
			"Official 1-Year Warranty"
		],
		specs: [
			{
				key: "Display",
				value: "6.67\" AMOLED, 120Hz"
			},
			{
				key: "RAM & Storage",
				value: "8GB RAM / 128GB ROM"
			},
			{
				key: "Battery",
				value: "5000mAh, 33W Fast Charging"
			},
			{
				key: "Camera",
				value: "108MP + 8MP + 2MP / 16MP Front"
			},
			{
				key: "Warranty",
				value: "12 Months Official Brand Warranty"
			}
		],
		options: [
			"Midnight Black",
			"Mint Green",
			"Ice Blue"
		],
		tags: [
			"phone",
			"xiaomi",
			"redmi",
			"amoled",
			"108mp"
		],
		images: [LOCAL_PHOTOS.smartDevices, makeProductSvg("Redmi Note 13", "Phones", "8GB/128GB")],
		videoUrl: "",
		videoPoster: LOCAL_PHOTOS.heroTech,
		deliveryInfo: "Inside Dhaka 24-48 hours (৳60). Outside Dhaka 2-4 days (৳120).",
		returnPolicy: "7-day easy replacement for factory defects with sealed box.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-samsung-a15",
		name: "Samsung Galaxy A15",
		slug: "samsung-galaxy-a15",
		brand: "Samsung",
		category: "Phones",
		price: 22900,
		oldPrice: 25500,
		stock: 22,
		unitsSold: 51,
		sku: "PZ-PH-102",
		rating: 4.7,
		reviewCount: 98,
		shortDescription: "Super AMOLED 90Hz display, 50MP main lens, Helio G99 & Samsung Knox security.",
		fullDescription: "The Samsung Galaxy A15 brings vibrant Super AMOLED brightness outdoors, smooth 90Hz scrolling, 4 generations of OS upgrades, and dependable 5000mAh battery endurance.",
		features: [
			"6.5\" Super AMOLED 90Hz Screen",
			"50MP Triple Camera System",
			"MediaTek Helio G99 Chipset",
			"25W Super Fast Charging Support"
		],
		specs: [
			{
				key: "Display",
				value: "6.5\" Super AMOLED 90Hz"
			},
			{
				key: "RAM & Storage",
				value: "6GB / 128GB"
			},
			{
				key: "Battery",
				value: "5000mAh"
			},
			{
				key: "Warranty",
				value: "1 Year Official Samsung BD Warranty"
			}
		],
		options: [
			"Blue Black",
			"Brave Black",
			"Light Blue"
		],
		tags: [
			"samsung",
			"galaxy",
			"a15",
			"amoled",
			"phone"
		],
		images: [makeProductSvg("Samsung Galaxy A15", "Phones", "Super AMOLED"), LOCAL_PHOTOS.heroTech],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Fast nationwide delivery with Cash on Delivery.",
		returnPolicy: "7 days easy return on unopened or defective items.",
		isFeatured: true,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-infinix-hot-40",
		name: "Infinix Hot 40",
		slug: "infinix-hot-40",
		brand: "Infinix",
		category: "Phones",
		price: 14500,
		oldPrice: 16500,
		stock: 36,
		unitsSold: 78,
		sku: "PZ-PH-103",
		rating: 4.5,
		reviewCount: 84,
		shortDescription: "Budget gaming powerhouse with 90Hz FHD+ punch-hole display & 33W fast charge.",
		fullDescription: "Built for students and mobile gamers in Bangladesh, the Infinix Hot 40 packs XBOOST gaming engine, 50MP AI camera, dual stereo speakers, and Magic Ring notifications.",
		features: [
			"6.78\" FHD+ 90Hz Display",
			"Helio G88 Gaming Processor",
			"50MP AI Camera + 32MP Selfie",
			"33W Enduring Fast Charge"
		],
		specs: [
			{
				key: "Display",
				value: "6.78\" IPS FHD+ 90Hz"
			},
			{
				key: "RAM & Storage",
				value: "8GB / 128GB"
			},
			{
				key: "Battery",
				value: "5000mAh, 33W"
			},
			{
				key: "Warranty",
				value: "1 Year Brand Warranty"
			}
		],
		options: [
			"Starfall Green",
			"Horizon Gold",
			"Starlit Black"
		],
		tags: [
			"infinix",
			"budget phone",
			"gaming phone"
		],
		images: [makeProductSvg("Infinix Hot 40", "Phones", "33W Charge")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka next-day delivery available.",
		returnPolicy: "7-day easy replacement.",
		isFeatured: false,
		isFlashSale: true,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-lenovo-ideapad-3",
		name: "Lenovo IdeaPad Slim 3 Core i5",
		slug: "lenovo-ideapad-slim-3-core-i5",
		brand: "Lenovo",
		category: "Laptops",
		price: 62e3,
		oldPrice: 68e3,
		stock: 11,
		unitsSold: 19,
		sku: "PZ-LP-201",
		rating: 4.9,
		reviewCount: 45,
		shortDescription: "13th Gen Intel Core i5, 16GB RAM, 512GB NVMe SSD, 15.6\" FHD Anti-Glare.",
		fullDescription: "Slim, lightweight, and whisper-quiet. The Lenovo IdeaPad Slim 3 handles software development, freelancing, study, and creative multitasking effortlessly with Rapid Charge Boost.",
		features: [
			"Intel Core i5 13th Gen Processor",
			"16GB LPDDR5 RAM & 512GB Gen4 SSD",
			"15.6\" Full HD Anti-Glare Panel",
			"Dolby Audio & Privacy Shutter Webcam"
		],
		specs: [
			{
				key: "Processor",
				value: "Intel Core i5-13420H"
			},
			{
				key: "Memory",
				value: "16GB DDR5"
			},
			{
				key: "Storage",
				value: "512GB M.2 NVMe SSD"
			},
			{
				key: "Display",
				value: "15.6\" FHD (1920x1080)"
			},
			{
				key: "Warranty",
				value: "2 Years Official Lenovo Warranty"
			}
		],
		options: ["Arctic Grey", "Abyss Blue"],
		tags: [
			"laptop",
			"lenovo",
			"ideapad",
			"core i5",
			"freelancing"
		],
		images: [LOCAL_PHOTOS.heroWorkspace, makeProductSvg("Lenovo IdeaPad Slim 3", "Laptops", "Core i5")],
		videoUrl: "",
		videoPoster: LOCAL_PHOTOS.heroWorkspace,
		deliveryInfo: "Insured courier across all 64 districts.",
		returnPolicy: "7-day DOA replacement + 2 years official warranty.",
		isFeatured: true,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-hp-15s-ryzen5",
		name: "HP 15s Ryzen 5",
		slug: "hp-15s-ryzen-5",
		brand: "HP",
		category: "Laptops",
		price: 58500,
		oldPrice: 64e3,
		stock: 9,
		unitsSold: 23,
		sku: "PZ-LP-202",
		rating: 4.7,
		reviewCount: 38,
		shortDescription: "AMD Ryzen 5 7520U, 8GB DDR5, 512GB SSD, Micro-edge FHD display.",
		fullDescription: "Engineered for reliability and battery longevity, the HP 15s delivers fast everyday productivity, crisp video calls, and a full-size keyboard with numeric keypad.",
		features: [
			"AMD Ryzen 5 7520U Processor",
			"8GB LPDDR5 RAM + 512GB NVMe SSD",
			"HP True Vision 720p HD Camera",
			"Up to 9.5 Hours Battery Life"
		],
		specs: [
			{
				key: "Processor",
				value: "AMD Ryzen 5 7520U"
			},
			{
				key: "RAM",
				value: "8GB LPDDR5"
			},
			{
				key: "Storage",
				value: "512GB PCIe NVMe SSD"
			},
			{
				key: "Warranty",
				value: "2 Years HP Official Warranty"
			}
		],
		options: ["Natural Silver"],
		tags: [
			"hp",
			"laptop",
			"ryzen 5",
			"student laptop"
		],
		images: [makeProductSvg("HP 15s Ryzen 5", "Laptops", "512GB SSD"), LOCAL_PHOTOS.heroWorkspace],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Free Dhaka express delivery.",
		returnPolicy: "7-day replacement guarantee.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: false,
		isNewArrival: false
	},
	{
		id: "prod-anc-headphones",
		name: "Wireless Noise Cancelling Headphones",
		slug: "wireless-noise-cancelling-headphones",
		brand: "SoundCore Pro",
		category: "Headphones",
		price: 3490,
		oldPrice: 4500,
		stock: 42,
		unitsSold: 87,
		sku: "PZ-AU-301",
		rating: 4.8,
		reviewCount: 116,
		shortDescription: "Hybrid ANC up to 40dB, 50-hour playtime, plush memory-foam earcups & Bluetooth 5.3.",
		fullDescription: "Silence Dhaka traffic and focus deeply on calls, music, or gaming. Supports dual-device multipoint pairing and USB-C quick charging (5 mins = 4 hours listening).",
		features: [
			"Hybrid Active Noise Cancellation",
			"50 Hours Battery Life",
			"Dual-Device Bluetooth 5.3",
			"Foldable Travel Pouch Included"
		],
		specs: [
			{
				key: "Driver",
				value: "40mm Dynamic Hi-Res"
			},
			{
				key: "Battery",
				value: "50 Hours (ANC Off) / 38 Hours (ANC On)"
			},
			{
				key: "Charging",
				value: "USB-C Fast Charge"
			},
			{
				key: "Warranty",
				value: "6 Months Replacement Warranty"
			}
		],
		options: ["Matte Black", "Sandstone"],
		tags: [
			"headphones",
			"anc",
			"wireless",
			"bluetooth",
			"audio"
		],
		images: [LOCAL_PHOTOS.audioGaming, makeProductSvg("ANC Headphones", "Headphones", "50H Battery")],
		videoUrl: "",
		videoPoster: LOCAL_PHOTOS.heroTech,
		deliveryInfo: "Inside Dhaka 24h delivery.",
		returnPolicy: "7-day easy return.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-tws-earbuds-pro",
		name: "TWS Earbuds Pro",
		slug: "tws-earbuds-pro",
		brand: "QCY",
		category: "Headphones",
		price: 1290,
		oldPrice: 1890,
		stock: 68,
		unitsSold: 134,
		sku: "PZ-AU-302",
		rating: 4.6,
		reviewCount: 175,
		shortDescription: "ENC quad-mic clear calling, IPX5 sweatproof & 28h pocket charging case.",
		fullDescription: "Ultra-lightweight in-ear TWS earbuds with punchy bass, low-latency gaming mode, and crystal-clear call noise reduction.",
		features: [
			"Quad-Mic ENC Call Clarity",
			"65ms Low-Latency Game Mode",
			"IPX5 Water Resistance",
			"28 Hours Total Playtime"
		],
		specs: [
			{
				key: "Bluetooth",
				value: "v5.3"
			},
			{
				key: "Waterproof",
				value: "IPX5"
			},
			{
				key: "Battery",
				value: "7h + 21h Case"
			},
			{
				key: "Warranty",
				value: "6 Months Warranty"
			}
		],
		options: ["Graphite Black", "Pearl White"],
		tags: [
			"tws",
			"earbuds",
			"bluetooth",
			"audio"
		],
		images: [makeProductSvg("TWS Earbuds Pro", "Headphones", "ENC Mic"), LOCAL_PHOTOS.audioGaming],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Cash on Delivery across Bangladesh.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-smart-fitness-watch",
		name: "Smart Fitness Watch",
		slug: "smart-fitness-watch",
		brand: "AmazFit Style",
		category: "Smart Watches",
		price: 2990,
		oldPrice: 3990,
		stock: 34,
		unitsSold: 92,
		sku: "PZ-SW-401",
		rating: 4.7,
		reviewCount: 109,
		shortDescription: "1.43\" AMOLED always-on display, Bluetooth calling, SpO2, heart rate & 10-day battery.",
		fullDescription: "Stay connected without pulling out your phone. Features metallic bezel, 100+ sports modes, Bangla notification font support, and IP68 water resistance.",
		features: [
			"1.43\" Bright AMOLED Display",
			"Bluetooth Voice Calling",
			"24/7 Heart Rate, Sleep & SpO2",
			"10 Days Battery Endurance"
		],
		specs: [
			{
				key: "Display",
				value: "1.43\" Round AMOLED"
			},
			{
				key: "Water Resistance",
				value: "IP68"
			},
			{
				key: "Battery",
				value: "Up to 10 Days"
			},
			{
				key: "Warranty",
				value: "6 Months Official Warranty"
			}
		],
		options: ["Obsidian Black", "Teal Strap"],
		tags: [
			"smartwatch",
			"fitness",
			"amoled",
			"calling watch"
		],
		images: [LOCAL_PHOTOS.heroTech, makeProductSvg("Smart Fitness Watch", "Smart Watches", "AMOLED")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Nationwide COD delivery.",
		returnPolicy: "7-day easy return.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-wireless-gamepad",
		name: "Wireless Gamepad Controller",
		slug: "wireless-gamepad-controller",
		brand: "Redragon",
		category: "Gaming",
		price: 2450,
		oldPrice: 3200,
		stock: 25,
		unitsSold: 46,
		sku: "PZ-GM-501",
		rating: 4.8,
		reviewCount: 64,
		shortDescription: "Dual-vibration Hall-effect triggers for PC, Android, and Console gaming.",
		fullDescription: "Responsive triggers, ergonomic anti-slip grips, 2.4GHz dongle + Bluetooth connectivity, and 15-hour rechargeable battery for marathon gaming sessions.",
		features: [
			"2.4GHz Wireless + Bluetooth + USB-C",
			"Hall-Effect Zero-Drift Triggers",
			"Dual Asymmetric Vibration Motors",
			"15h Rechargeable Battery"
		],
		specs: [
			{
				key: "Compatibility",
				value: "Windows PC, Android, Switch"
			},
			{
				key: "Battery",
				value: "600mAh Li-ion"
			},
			{
				key: "Warranty",
				value: "6 Months Warranty"
			}
		],
		options: ["Stealth Black", "Coral Red"],
		tags: [
			"gamepad",
			"controller",
			"gaming",
			"pc gaming"
		],
		images: [LOCAL_PHOTOS.audioGaming, makeProductSvg("Wireless Gamepad", "Gaming", "PC/Android")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "24-48h Inside Dhaka.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-rgb-gaming-mouse",
		name: "RGB Gaming Mouse",
		slug: "rgb-gaming-mouse",
		brand: "Fantech",
		category: "Gaming",
		price: 890,
		oldPrice: 1290,
		stock: 54,
		unitsSold: 112,
		sku: "PZ-GM-502",
		rating: 4.5,
		reviewCount: 89,
		shortDescription: "7200 DPI optical sensor, lightweight 69g shell & 20M click Huano switches.",
		fullDescription: "Pinpoint accuracy for Valorant, CS2, and everyday work with customizable DPI steps and braided paracord cable.",
		features: [
			"7200 Adjustable DPI Sensor",
			"Ultra-Light 69g Ergonomic Body",
			"7 Programmable Buttons",
			"Dynamic RGB Lighting"
		],
		specs: [
			{
				key: "DPI",
				value: "800 - 7200 DPI"
			},
			{
				key: "Switches",
				value: "20 Million Clicks"
			},
			{
				key: "Weight",
				value: "69g"
			}
		],
		options: ["Black", "White"],
		tags: [
			"mouse",
			"gaming mouse",
			"rgb",
			"esports"
		],
		images: [makeProductSvg("RGB Gaming Mouse", "Gaming", "7200 DPI"), LOCAL_PHOTOS.audioGaming],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka ৳60.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: true,
		isTrending: false,
		isNewArrival: false
	},
	{
		id: "prod-power-bank-20k",
		name: "20000mAh Power Bank",
		slug: "20000mah-power-bank",
		brand: "Baseus",
		category: "Accessories",
		price: 1650,
		oldPrice: 2100,
		stock: 75,
		unitsSold: 158,
		sku: "PZ-AC-601",
		rating: 4.7,
		reviewCount: 204,
		shortDescription: "22.5W PD fast charging, LED percentage display & dual USB-A + USB-C ports.",
		fullDescription: "Essential travel and load-shedding companion. Safely fast-charges phones 4 times with multi-layer surge protection.",
		features: [
			"True 20000mAh High-Density Cell",
			"22.5W PD + QC 3.0 Fast Charge",
			"LED Digital Battery Display",
			"Airline-Safe Certified"
		],
		specs: [
			{
				key: "Capacity",
				value: "20000mAh / 74Wh"
			},
			{
				key: "Output",
				value: "Max 22.5W"
			},
			{
				key: "Ports",
				value: "1x USB-C, 2x USB-A"
			},
			{
				key: "Warranty",
				value: "6 Months Warranty"
			}
		],
		options: ["Matte Black", "White"],
		tags: [
			"power bank",
			"20000mah",
			"baseus",
			"fast charge"
		],
		images: [LOCAL_PHOTOS.smartDevices, makeProductSvg("20000mAh Power Bank", "Accessories", "22.5W PD")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Fast delivery nationwide.",
		returnPolicy: "7-day replacement.",
		isFeatured: true,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-65w-gan-charger",
		name: "65W Fast Charger",
		slug: "65w-fast-charger",
		brand: "Anker GaN",
		category: "Accessories",
		price: 1190,
		oldPrice: 1590,
		stock: 60,
		unitsSold: 95,
		sku: "PZ-AC-602",
		rating: 4.8,
		reviewCount: 77,
		shortDescription: "Compact 3-port GaN charger for laptops, tablets, and smartphones.",
		fullDescription: "Power your MacBook/IdeaPad and two phones simultaneously from a single compact UK/BD 3-pin compatible adapter.",
		features: [
			"65W GaN High-Efficiency Tech",
			"2x USB-C + 1x USB-A Ports",
			"Cool-Temp ActiveShield Safety",
			"Compact Travel Size"
		],
		specs: [
			{
				key: "Output",
				value: "65W Max Power Delivery"
			},
			{
				key: "Ports",
				value: "2x Type-C, 1x USB-A"
			},
			{
				key: "Warranty",
				value: "6 Months Replacement"
			}
		],
		options: ["Charcoal"],
		tags: [
			"charger",
			"65w",
			"gan",
			"usb-c",
			"laptop charger"
		],
		images: [makeProductSvg("65W Fast Charger", "Accessories", "GaN 3-Port")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka 24h.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-bluetooth-speaker",
		name: "Portable Bluetooth Speaker",
		slug: "portable-bluetooth-speaker",
		brand: "JBL Clip Style",
		category: "Headphones",
		price: 1890,
		oldPrice: 2490,
		stock: 38,
		unitsSold: 67,
		sku: "PZ-AU-303",
		rating: 4.6,
		reviewCount: 72,
		shortDescription: "360° rich bass audio, IPX7 waterproof body & 12-hour outdoor battery.",
		fullDescription: "Built for rooftops, Cox’s Bazar trips, and desk listening with stereo TWS pairing and built-in microphone.",
		features: [
			"12 Hours Continuous Playtime",
			"IPX7 Waterproof & Dustproof",
			"TWS Dual Speaker Pairing",
			"USB-C Charging"
		],
		specs: [
			{
				key: "Output",
				value: "15W RMS"
			},
			{
				key: "Battery",
				value: "12 Hours"
			},
			{
				key: "Waterproof",
				value: "IPX7"
			}
		],
		options: ["Deep Teal", "Charcoal"],
		tags: [
			"speaker",
			"bluetooth",
			"portable",
			"audio"
		],
		images: [LOCAL_PHOTOS.heroWorkspace, makeProductSvg("Bluetooth Speaker", "Headphones", "IPX7")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Nationwide COD.",
		returnPolicy: "7-day return.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-wifi-security-camera",
		name: "Wi-Fi Smart Security Camera",
		slug: "wifi-smart-security-camera",
		brand: "IMOU",
		category: "Smart Home",
		price: 2350,
		oldPrice: 2990,
		stock: 31,
		unitsSold: 58,
		sku: "PZ-SH-701",
		rating: 4.8,
		reviewCount: 91,
		shortDescription: "2K 3MP 360° pan-tilt indoor camera with AI human detection & night vision.",
		fullDescription: "Keep an eye on your home, shop, or office from anywhere via smartphone app with two-way talk and microSD recording.",
		features: [
			"2K 3MP Crystal Clear Video",
			"360° Pan & Tilt Tracking",
			"Infrared Night Vision up to 10m",
			"Two-Way Audio & Siren Alert"
		],
		specs: [
			{
				key: "Resolution",
				value: "2304 x 1296 (3MP)"
			},
			{
				key: "Storage",
				value: "MicroSD up to 256GB"
			},
			{
				key: "Warranty",
				value: "1 Year Warranty"
			}
		],
		options: ["Pure White"],
		tags: [
			"cctv",
			"smart camera",
			"wifi camera",
			"smart home"
		],
		images: [LOCAL_PHOTOS.smartDevices, makeProductSvg("Wi-Fi Security Camera", "Smart Home", "2K 360°")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Free setup guide included.",
		returnPolicy: "7-day replacement.",
		isFeatured: true,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-smart-led-bulb",
		name: "Smart LED Bulb",
		slug: "smart-led-bulb",
		brand: "Yeelight",
		category: "Smart Home",
		price: 650,
		oldPrice: 890,
		stock: 80,
		unitsSold: 140,
		sku: "PZ-SH-702",
		rating: 4.5,
		reviewCount: 66,
		shortDescription: "16 million RGB colors + tunable warm/cool white, voice control & schedule timer.",
		fullDescription: "Transform any room ambiance from cozy warm reading light to vibrant gaming colors via Wi-Fi app with no hub required.",
		features: [
			"9W Energy-Saving 850 Lumens",
			"16M RGB + Warm/Cool White",
			"Alexa & Google Home Compatible",
			"B22 / E27 Fitting"
		],
		specs: [
			{
				key: "Power",
				value: "9W (850lm)"
			},
			{
				key: "Connectivity",
				value: "Wi-Fi 2.4GHz"
			},
			{
				key: "Lifespan",
				value: "25,000 Hours"
			}
		],
		options: ["E27 Screw", "B22 Pin"],
		tags: [
			"smart bulb",
			"led",
			"rgb",
			"smart home"
		],
		images: [makeProductSvg("Smart LED Bulb", "Smart Home", "16M RGB"), LOCAL_PHOTOS.smartDevices],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka ৳60.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: true,
		isTrending: false,
		isNewArrival: false
	},
	{
		id: "prod-cotton-panjabi",
		name: "Premium Cotton Panjabi",
		slug: "premium-cotton-panjabi",
		brand: "Aarong Craft Line",
		category: "Fashion",
		price: 1450,
		oldPrice: 1950,
		stock: 45,
		unitsSold: 103,
		sku: "PZ-FA-801",
		rating: 4.8,
		reviewCount: 118,
		shortDescription: "100% breathable combed cotton Panjabi with subtle collar embroidery for everyday & festive wear.",
		fullDescription: "Tailored in Bangladesh from soft 100% long-staple cotton suited for tropical weather. Crisp stand collar, side pockets, and zero-shrinkage pre-washed finish.",
		features: [
			"100% Pure Combed Cotton",
			"Hand-Finished Minimal Embroidery",
			"Breathable All-Season Weave",
			"Pre-Washed Colorfast Fabric"
		],
		specs: [
			{
				key: "Material",
				value: "100% Cotton"
			},
			{
				key: "Fit",
				value: "Regular Comfort Fit"
			},
			{
				key: "Care",
				value: "Gentle Machine or Hand Wash"
			}
		],
		options: [
			"M (40)",
			"L (42)",
			"XL (44)",
			"XXL (46)"
		],
		tags: [
			"panjabi",
			"fashion",
			"cotton",
			"eid",
			"menswear"
		],
		images: [LOCAL_PHOTOS.lifestyleFashion, makeProductSvg("Premium Cotton Panjabi", "Fashion", "100% Cotton")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Fast Dhaka & nationwide delivery.",
		returnPolicy: "7-day size exchange available.",
		isFeatured: true,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-casual-sneakers",
		name: "Casual Sneakers",
		slug: "casual-sneakers",
		brand: "StepBD",
		category: "Fashion",
		price: 2290,
		oldPrice: 2990,
		stock: 30,
		unitsSold: 62,
		sku: "PZ-FA-802",
		rating: 4.6,
		reviewCount: 74,
		shortDescription: "Minimalist off-white cushioned sneakers with breathable lining & anti-slip sole.",
		fullDescription: "Versatile everyday sneakers designed to pair effortlessly with jeans, chinos, or Panjabi. High-rebound insole reduces walking fatigue.",
		features: [
			"Soft Memory Foam Insole",
			"Anti-Skid Rubber Outsole",
			"Easy-Clean Vegan Leather Upper"
		],
		specs: [{
			key: "Upper",
			value: "Microfiber Vegan Leather"
		}, {
			key: "Sole",
			value: "High-Grip TPR"
		}],
		options: [
			"EU 40",
			"EU 41",
			"EU 42",
			"EU 43",
			"EU 44"
		],
		tags: [
			"sneakers",
			"shoes",
			"fashion",
			"footwear"
		],
		images: [LOCAL_PHOTOS.lifestyleFashion, makeProductSvg("Casual Sneakers", "Fashion", "Memory Foam")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Nationwide COD.",
		returnPolicy: "7-day size exchange.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-hydrating-face-serum",
		name: "Hydrating Face Serum",
		slug: "hydrating-face-serum",
		brand: "Botanica Care",
		category: "Beauty & Skincare",
		price: 990,
		oldPrice: 1350,
		stock: 52,
		unitsSold: 88,
		sku: "PZ-SK-901",
		rating: 4.7,
		reviewCount: 93,
		shortDescription: "2% Hyaluronic Acid + Niacinamide lightweight non-sticky glow serum (30ml).",
		fullDescription: "Formulated for humid South Asian weather. Deeply hydrates without clogging pores, balances oil, and brightens skin tone.",
		features: [
			"2% Multi-Molecular Hyaluronic Acid",
			"5% Niacinamide",
			"Fragrance-Free & Paraben-Free",
			"Dermatologically Tested"
		],
		specs: [{
			key: "Volume",
			value: "30ml Amber Dropper"
		}, {
			key: "Skin Type",
			value: "All Skin Types"
		}],
		options: ["30ml Bottle"],
		tags: [
			"serum",
			"skincare",
			"beauty",
			"hyaluronic",
			"women"
		],
		images: [makeProductSvg("Hydrating Face Serum", "Beauty & Skincare", "30ml Glow"), LOCAL_PHOTOS.lifestyleFashion],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Sealed authentic packaging.",
		returnPolicy: "7-day return if seal intact.",
		isFeatured: false,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-vitamin-c-glow-serum",
		name: "Vitamin C 15% Brightening Serum",
		slug: "vitamin-c-15-brightening-serum",
		brand: "Botanica Care",
		category: "Beauty & Skincare",
		price: 1150,
		oldPrice: 1490,
		stock: 44,
		unitsSold: 76,
		sku: "PZ-SK-902",
		rating: 4.8,
		reviewCount: 68,
		shortDescription: "15% Ethyl Ascorbic Acid + Ferulic glow serum to fade dark spots and dullness.",
		fullDescription: "Lightweight morning Vitamin C serum tailored for women in Bangladesh. Helps fade post-acne marks, boosts natural radiance, and absorbs cleanly without greasiness.",
		features: [
			"15% Stable Vitamin C",
			"Ferulic Acid + Vitamin E",
			"Brightens Uneven Skin Tone",
			"Non-Comedogenic & Alcohol-Free"
		],
		specs: [{
			key: "Volume",
			value: "30ml UV-Protected Dropper"
		}, {
			key: "Best For",
			value: "Dull Skin & Dark Spots"
		}],
		options: ["30ml Dropper"],
		tags: [
			"vitamin c",
			"serum",
			"brightening",
			"skincare",
			"women"
		],
		images: [makeProductSvg("Vitamin C 15% Serum", "Beauty & Skincare", "Brightening"), LOCAL_PHOTOS.lifestyleFashion],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka 24-48h. Nationwide COD.",
		returnPolicy: "7-day replacement if seal intact.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-niacinamide-10-zinc-serum",
		name: "Niacinamide 10% + Zinc Pore Serum",
		slug: "niacinamide-10-zinc-pore-serum",
		brand: "DermaPure BD",
		category: "Beauty & Skincare",
		price: 890,
		oldPrice: 1150,
		stock: 60,
		unitsSold: 112,
		sku: "PZ-SK-903",
		rating: 4.8,
		reviewCount: 105,
		shortDescription: "Oil-control serum with 10% Niacinamide + 1% Zinc PCA for smooth poreless skin.",
		fullDescription: "Controls excess sebum in humid weather, minimizes visible pores, and calms redness without drying out your moisture barrier.",
		features: [
			"10% Pure Niacinamide",
			"1% Zinc PCA Sebum Control",
			"Water-Light Absorption",
			"Fragrance-Free Formula"
		],
		specs: [{
			key: "Volume",
			value: "30ml Glass Bottle"
		}, {
			key: "Skin Type",
			value: "Oily & Combination Skin"
		}],
		options: ["30ml Bottle"],
		tags: [
			"niacinamide",
			"serum",
			"oil control",
			"skincare",
			"women"
		],
		images: [makeProductSvg("Niacinamide 10% Serum", "Beauty & Skincare", "Pore Care")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Fast sealed delivery nationwide.",
		returnPolicy: "7-day easy return.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-brightening-day-cream",
		name: "Daily Barrier & Glow Face Cream",
		slug: "daily-barrier-glow-face-cream",
		brand: "Aura Botanicals",
		category: "Beauty & Skincare",
		price: 1050,
		oldPrice: 1350,
		stock: 38,
		unitsSold: 62,
		sku: "PZ-SK-904",
		rating: 4.7,
		reviewCount: 49,
		shortDescription: "Ceramide + Rice Water soothing moisturizing cream for soft, radiant everyday skin (50g).",
		fullDescription: "Nourishes and repairs skin barrier all day with Korean-inspired rice extract, 5 essential ceramides, and panthenol—breathable even in warm weather.",
		features: [
			"5x Ceramide Complex",
			"Fermented Rice Extract",
			"48-Hour Moisture Lock",
			"Zero Heavy Residue"
		],
		specs: [{
			key: "Net Weight",
			value: "50g Glass Jar"
		}, {
			key: "Skin Type",
			value: "Dry, Normal & Sensitive"
		}],
		options: ["50g Jar"],
		tags: [
			"cream",
			"day cream",
			"moisturizer",
			"ceramide",
			"skincare",
			"women"
		],
		images: [makeProductSvg("Daily Glow Face Cream", "Beauty & Skincare", "Ceramide 50g")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Sealed authentic jar.",
		returnPolicy: "7-day return if seal intact.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-collagen-night-repair-cream",
		name: "Collagen & Saffron Night Repair Cream",
		slug: "collagen-saffron-night-repair-cream",
		brand: "RoopKotha Skincare",
		category: "Beauty & Skincare",
		price: 1290,
		oldPrice: 1650,
		stock: 32,
		unitsSold: 57,
		sku: "PZ-SK-905",
		rating: 4.9,
		reviewCount: 61,
		shortDescription: "Overnight firming & brightening night cream enriched with Kashmiri saffron and peptides.",
		fullDescription: "Wakes up tired skin with deep overnight hydration. Enriched with saffron extract, marine collagen peptides, and squalane for supple morning glow.",
		features: [
			"Kashmiri Saffron Extract",
			"Hydrolyzed Collagen + Peptides",
			"Deep Overnight Renewal",
			"Paraben & Sulfate Free"
		],
		specs: [{
			key: "Net Weight",
			value: "50g Jar"
		}, {
			key: "Routine",
			value: "Night Skincare Step"
		}],
		options: ["50g Night Jar"],
		tags: [
			"night cream",
			"cream",
			"saffron",
			"collagen",
			"skincare",
			"women"
		],
		images: [makeProductSvg("Saffron Night Cream", "Beauty & Skincare", "Night Repair")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Nationwide Cash on Delivery.",
		returnPolicy: "7-day return if unopened.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-hydra-matte-sunscreen",
		name: "Aqua Matte UV Defense Gel Cream SPF 50+",
		slug: "aqua-matte-uv-defense-gel-cream-spf50",
		brand: "DermaPure BD",
		category: "Beauty & Skincare",
		price: 850,
		oldPrice: 1090,
		stock: 65,
		unitsSold: 134,
		sku: "PZ-SK-906",
		rating: 4.8,
		reviewCount: 118,
		shortDescription: "Broad-spectrum PA++++ zero white-cast gel cream sunscreen for daily outdoor protection.",
		fullDescription: "Featherlight watery gel cream that disappears in seconds with zero white cast or sweatiness—ideal under makeup or bare skin.",
		features: [
			"SPF 50+ PA++++ Protection",
			"Zero White Cast & Non-Greasy",
			"Infused with Centella & Aloe",
			"Water & Sweat Resistant"
		],
		specs: [{
			key: "Net Weight",
			value: "50ml Tube"
		}, {
			key: "Finish",
			value: "Soft Matte"
		}],
		options: ["50ml Tube"],
		tags: [
			"sunscreen",
			"gel cream",
			"spf 50",
			"skincare",
			"women"
		],
		images: [makeProductSvg("Aqua Matte SPF 50+ Cream", "Beauty & Skincare", "Zero Cast")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Ready stock for immediate dispatch.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: true
	},
	{
		id: "prod-rose-lip-cheek-tint",
		name: "Velvet Rose Lip & Cheek Tint",
		slug: "velvet-rose-lip-cheek-tint",
		brand: "Aura Botanicals",
		category: "Beauty & Skincare",
		price: 590,
		oldPrice: 780,
		stock: 48,
		unitsSold: 81,
		sku: "PZ-BT-907",
		rating: 4.7,
		reviewCount: 54,
		shortDescription: "Long-wear Jojoba & Rosehip nourishing tint for natural rosy lips and cheeks.",
		fullDescription: "Blendable velvet-matte lip and cheek tint enriched with rosehip oil and vitamin E so lips stay soft all day.",
		features: [
			"2-in-1 Lip & Cheek Formula",
			"Jojoba & Rosehip Infused",
			"Smudge-Proof Natural Finish"
		],
		specs: [{
			key: "Volume",
			value: "10ml Applicator"
		}, {
			key: "Shades",
			value: "Rosewood / Berry / Peach"
		}],
		options: [
			"Rosewood",
			"Warm Berry",
			"Soft Peach"
		],
		tags: [
			"lip tint",
			"beauty",
			"makeup",
			"women"
		],
		images: [makeProductSvg("Velvet Rose Lip Tint", "Beauty & Skincare", "2-in-1")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Sealed authentic cosmetics.",
		returnPolicy: "7-day return if sealed.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-minimal-desk-organizer",
		name: "Minimal Desk Organizer",
		slug: "minimal-desk-organizer",
		brand: "WoodCraft BD",
		category: "Home and Living",
		price: 790,
		oldPrice: 1090,
		stock: 48,
		unitsSold: 71,
		sku: "PZ-HL-1001",
		rating: 4.6,
		reviewCount: 54,
		shortDescription: "Multi-compartment walnut-finish desk caddy for phone, pens, notebooks & cables.",
		fullDescription: "Declutter your study or work-from-home table with handcrafted matte walnut compartments and cable pass-through.",
		features: [
			"Eco-Friendly Engineered Walnut",
			"4 Smart Compartments",
			"Anti-Scratch Felt Base"
		],
		specs: [{
			key: "Dimensions",
			value: "24 x 14 x 11 cm"
		}, {
			key: "Material",
			value: "Walnut Veneer Wood"
		}],
		options: ["Walnut Brown", "Teak Natural"],
		tags: [
			"desk",
			"organizer",
			"home",
			"office"
		],
		images: [LOCAL_PHOTOS.heroWorkspace, makeProductSvg("Minimal Desk Organizer", "Home and Living", "Walnut")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Safe bubble-wrapped shipping.",
		returnPolicy: "7-day easy return.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-aroma-diffuser",
		name: "Aroma Diffuser with LED Light",
		slug: "aroma-diffuser-led-light",
		brand: "ZenHome",
		category: "Home and Living",
		price: 1390,
		oldPrice: 1790,
		stock: 33,
		unitsSold: 64,
		sku: "PZ-HL-1002",
		rating: 4.8,
		reviewCount: 82,
		shortDescription: "300ml ultrasonic cool-mist humidifier & essential oil diffuser with warm night glow.",
		fullDescription: "Creates a calming atmosphere in bedrooms and workspaces with whisper-quiet misting and auto shut-off protection.",
		features: [
			"300ml Tank (Up to 8 Hours Mist)",
			"7 Soothing Ambient LED Colors",
			"Ultra-Quiet <30dB Operation",
			"Auto Water-Low Shutoff"
		],
		specs: [{
			key: "Capacity",
			value: "300ml"
		}, {
			key: "Power",
			value: "USB-C / Adapter Included"
		}],
		options: ["Warm Cream", "Oak Finish"],
		tags: [
			"diffuser",
			"humidifier",
			"home living",
			"decor"
		],
		images: [makeProductSvg("Aroma Diffuser", "Home and Living", "300ml Mist"), LOCAL_PHOTOS.heroWorkspace],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Inside Dhaka 24-48h.",
		returnPolicy: "7-day replacement.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-adjustable-dumbbell",
		name: "Adjustable Dumbbell Set",
		slug: "adjustable-dumbbell-set",
		brand: "IronFit BD",
		category: "Sports",
		price: 2890,
		oldPrice: 3590,
		stock: 16,
		unitsSold: 39,
		sku: "PZ-SP-1101",
		rating: 4.7,
		reviewCount: 47,
		shortDescription: "20kg total home gym dumbbell & barbell convertible set with non-slip grip.",
		fullDescription: "Train at home anytime with heavy-duty floor-safe plates, double safety lock collars, and foam-padded barbell connector.",
		features: [
			"Convertible Dumbbell & Barbell Mode",
			"Floor-Safe PE Coated Plates",
			"Double Spin-Lock Safety Nuts"
		],
		specs: [{
			key: "Total Weight",
			value: "20kg (10kg x 2)"
		}, {
			key: "Includes",
			value: "2 Bars, 1 Connector, 12 Plates"
		}],
		options: ["20kg Set"],
		tags: [
			"dumbbell",
			"fitness",
			"gym",
			"sports"
		],
		images: [makeProductSvg("Adjustable Dumbbell Set", "Sports", "20kg Home Gym")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Doorstep delivery inside & outside Dhaka.",
		returnPolicy: "7-day damage replacement.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: false
	},
	{
		id: "prod-kids-building-blocks",
		name: "Kids Building Blocks Set",
		slug: "kids-building-blocks-set",
		brand: "EduPlay",
		category: "Toys and Kids",
		price: 1190,
		oldPrice: 1590,
		stock: 44,
		unitsSold: 76,
		sku: "PZ-TK-1201",
		rating: 4.9,
		reviewCount: 68,
		shortDescription: "160-piece non-toxic STEM creative building blocks with storage tub for ages 3+.",
		fullDescription: "Boost creativity, spatial thinking, and screen-free playtime with rounded-edge BPA-free colorful interlocking blocks.",
		features: [
			"160 Vibrant STEM Pieces",
			"BPA-Free Rounded Safe Edges",
			"Sturdy Storage Box Included"
		],
		specs: [{
			key: "Pieces",
			value: "160 Pieces"
		}, {
			key: "Age Group",
			value: "3 - 10 Years"
		}],
		options: ["160 Pcs Set"],
		tags: [
			"toys",
			"kids",
			"blocks",
			"stem"
		],
		images: [makeProductSvg("Kids Building Blocks", "Toys and Kids", "160 Pcs STEM")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Gift wrapping note supported.",
		returnPolicy: "7-day return.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: false,
		isNewArrival: true
	},
	{
		id: "prod-bangla-novel-collection",
		name: "Bestselling Bangla Novel Collection",
		slug: "bestselling-bangla-novel-collection",
		brand: "Bangla Boi Ghar",
		category: "Books",
		price: 850,
		oldPrice: 1100,
		stock: 60,
		unitsSold: 121,
		sku: "PZ-BK-1301",
		rating: 4.9,
		reviewCount: 153,
		shortDescription: "Curated 3-book hardcover box set of timeless modern Bangla fiction classics.",
		fullDescription: "Printed on cream acid-free paper with crisp Bengali typography and durable hardcover binding—perfect for personal libraries and gifting.",
		features: [
			"3 Hardcover Classic Titles",
			"80gsm Cream Reading Paper",
			"Protective Collector Slipcase"
		],
		specs: [{
			key: "Language",
			value: "Bangla"
		}, {
			key: "Binding",
			value: "Hardcover Box Set"
		}],
		options: ["3-Book Box Set"],
		tags: [
			"books",
			"bangla",
			"novel",
			"boimela",
			"gift"
		],
		images: [LOCAL_PHOTOS.lifestyleFashion, makeProductSvg("Bangla Novel Collection", "Books", "3-Book Set")],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Delivered carefully in waterproof packaging.",
		returnPolicy: "7-day replacement for print defects.",
		isFeatured: false,
		isFlashSale: false,
		isTrending: true,
		isNewArrival: false
	},
	{
		id: "prod-premium-honey-500g",
		name: "Premium Honey 500g",
		slug: "premium-honey-500g",
		brand: "Sundarban Pure",
		category: "Groceries",
		price: 690,
		oldPrice: 850,
		stock: 72,
		unitsSold: 186,
		sku: "PZ-GR-1401",
		rating: 4.8,
		reviewCount: 211,
		shortDescription: "100% raw, unfiltered Sundarban natural multifloral honey in airtight glass jar.",
		fullDescription: "Sourced ethically from Khulna & Sundarbans beekeepers. Lab-tested for purity with zero added sugar or artificial syrups.",
		features: [
			"100% Pure Raw Unheated Honey",
			"Lab-Tested Zero Added Sugar",
			"Hygienic Sealed Glass Jar"
		],
		specs: [{
			key: "Net Weight",
			value: "500g"
		}, {
			key: "Origin",
			value: "Sundarbans Region, Bangladesh"
		}],
		options: ["500g Glass Jar"],
		tags: [
			"honey",
			"organic",
			"groceries",
			"sundarban",
			"food"
		],
		images: [makeProductSvg("Premium Honey 500g", "Groceries", "100% Pure"), LOCAL_PHOTOS.lifestyleFashion],
		videoUrl: "",
		videoPoster: "",
		deliveryInfo: "Leak-proof cushioned box delivery.",
		returnPolicy: "100% purity satisfaction guarantee.",
		isFeatured: true,
		isFlashSale: true,
		isTrending: true,
		isNewArrival: false
	}
];
export const SEED_REVIEWS = [
	{
		id: "rev-1",
		productId: "prod-redmi-note-13",
		productName: "Redmi Note 13 (8GB/128GB)",
		authorName: "Tanvir Ahmed",
		city: "Dhanmondi, Dhaka",
		rating: 5,
		approved: true,
		comment: "Received my Redmi Note 13 within 20 hours in Dhaka! Official seal intact and Cash on Delivery was completely hassle-free."
	},
	{
		id: "rev-2",
		productId: "prod-anc-headphones",
		productName: "Wireless Noise Cancelling Headphones",
		authorName: "Nusrat Jahan",
		city: "Banani, Dhaka",
		rating: 5,
		approved: true,
		comment: "The ANC blocks out traffic noise on my commute. Battery easily lasts me a full workweek on one charge."
	},
	{
		id: "rev-3",
		productId: "prod-lenovo-ideapad-3",
		productName: "Lenovo IdeaPad Slim 3 Core i5",
		authorName: "Mehedi Hasan",
		city: "Agrabad, Chattogram",
		rating: 5,
		approved: true,
		comment: "Best price in BD for the 13th Gen i5 16GB variant. Courier packaging to Chattogram was super secure."
	},
	{
		id: "rev-4",
		productId: "prod-cotton-panjabi",
		productName: "Premium Cotton Panjabi",
		authorName: "Rafiqul Islam",
		city: "Zindabazar, Sylhet",
		rating: 5,
		approved: true,
		comment: "Fabric is genuinely breathable cotton and stitching is clean. Ordered two more for my brothers."
	},
	{
		id: "rev-5",
		productId: "prod-premium-honey-500g",
		productName: "Premium Honey 500g",
		authorName: "Farhana Yasmin",
		city: "Uttara, Dhaka",
		rating: 5,
		approved: true,
		comment: "Authentic Sundarban honey aroma and taste. Love that Pazaro BD lets me pay easily via bKash or COD."
	},
	{
		id: "rev-6",
		productId: "prod-smart-fitness-watch",
		productName: "Smart Fitness Watch",
		authorName: "Sajid Rahman",
		city: "Rajshahi",
		rating: 4,
		approved: true,
		comment: "AMOLED screen is super bright under sunlight and step tracking is accurate. Delivery took just 2 days."
	}
];
export const SEED_POSTS = [
	{
		id: "post-budget-phones-bd-2026",
		title: "Top 5 Smartphones Under ৳25,000 in Bangladesh (2026 Buyer Guide)",
		slug: "top-smartphones-under-25000-bd",
		category: "Buying Guide",
		coverImage: LOCAL_PHOTOS.heroTech,
		excerpt: "Compare AMOLED displays, camera sensors, and official warranty perks before picking your next everyday phone.",
		body: "<p>Choosing a reliable smartphone under <strong>৳25,000</strong> in Bangladesh comes down to display quality, battery charging speed, and official warranty support.</p><h3>1. Redmi Note 13 (8GB/128GB)</h3><p>If photography and a bright 120Hz AMOLED screen matter most, the 108MP sensor and slim bezels make it a standout daily driver at ৳21,500.</p><h3>2. Samsung Galaxy A15</h3><p>Samsung’s Super AMOLED panel and long-term software updates give peace of mind for families and professionals.</p><h3>3. Infinix Hot 40</h3><p>At ৳14,500, students and casual mobile gamers get tremendous value with 33W charging and stereo speakers.</p>",
		tags: [
			"smartphones",
			"buying guide",
			"bangladesh"
		],
		published: true
	},
	{
		id: "post-wfh-desk-setup",
		title: "How to Build a Clean Study & Freelancing Desk Under ৳65,000",
		slug: "freelancing-desk-setup-bd",
		category: "Tech Tips",
		coverImage: LOCAL_PHOTOS.heroWorkspace,
		excerpt: "Pair the right Core i5 or Ryzen 5 laptop with a quiet workspace organizer and backup power essentials.",
		body: "<p>Whether you are a university student or remote freelancer in Dhaka, an ergonomic, clutter-free desk boosts focus immediately.</p><p>Start with a fast NVMe SSD laptop like the <strong>Lenovo IdeaPad Slim 3 Core i5</strong> or <strong>HP 15s Ryzen 5</strong>, add a <strong>20000mAh Power Bank</strong> for load-shedding backup, and keep cables tidy with a walnut desk organizer.</p>",
		tags: [
			"laptop",
			"freelancing",
			"workspace"
		],
		published: true
	},
	{
		id: "post-cod-bkash-shopping-tips",
		title: "Smart Online Shopping in Bangladesh: COD, bKash & Warranty Checklist",
		slug: "smart-online-shopping-bd",
		category: "Offers & Tips",
		coverImage: LOCAL_PHOTOS.lifestyleFashion,
		excerpt: "Always check SKU seals, 7-day return coverage, and real-time order tracking before accepting parcels.",
		body: "<p>Online shopping across 64 districts has never been easier. With <strong>Pazaro BD</strong>, every order gets a unique tracking code immediately upon checkout.</p><p>Choose <strong>Cash on Delivery</strong>, <strong>bKash</strong>, or <strong>Nagad</strong>, track your parcel live on our Track Order page, and enjoy transparent 7-day returns.</p>",
		tags: [
			"cod",
			"bkash",
			"nagad",
			"delivery"
		],
		published: true
	}
];
export const SEED_GENERAL_SETTINGS = {
	id: "general",
	siteName: "Pazaro BD",
	tagline: "Your Bazaar, Smarter",
	logoUrl: "",
	faviconUrl: "",
	phone: "+880 1700-000000",
	whatsapp: "8801700000000",
	email: "support@pazarobd.com",
	address: "House 24, Road 11, Banani, Dhaka 1213, Bangladesh",
	facebookUrl: "https://facebook.com",
	instagramUrl: "https://instagram.com",
	youtubeUrl: "https://youtube.com",
	insideDhakaFee: 60,
	outsideDhakaFee: 120,
	freeDeliveryMin: 5e3,
	currencySymbol: "৳",
	mapEnabled: true,
	mapProvider: "osm",
	mapDefaultLat: 23.8103,
	mapDefaultLng: 90.4125,
	mapDefaultZoom: 12,
	footerText: "© 2026 Pazaro BD. Your Bazaar, Smarter. Delivering happiness across all 64 districts of Bangladesh.",
	maintenanceMode: false
};
export const SEED_THEME_SETTINGS = {
	id: "theme",
	heroVersion: 2,
	primaryColor: "#0F766E",
	accentColor: "#FF6B57",
	bgColor: "#FAF8F5",
	heroSlides: [
		{
			id: "slide-1",
			kicker: "Bangladesh Tech & Lifestyle Bazaar",
			headline: "Smart Gear & Everyday Essentials, Delivered Fast",
			subtext: "Shop verified phones, laptops, audio, fashion & daily staples across 64 districts with Cash on Delivery, bKash & Nagad.",
			buttonText: "Shop Deals Now",
			buttonLink: "#deals",
			imageUrl: LOCAL_PHOTOS.heroTech,
			featuredProductId: "prod-redmi-note-13",
			badgeText: "Flash Deal · Save ৳2,500",
			animStyle: "float"
		},
		{
			id: "slide-2",
			kicker: "Work & Study Upgrade",
			headline: "Laptops & Minimal Workspace Picks for 2026",
			subtext: "Official warranty laptops, fast GaN chargers, and calm home-office accessories ready for next-day Dhaka delivery.",
			buttonText: "Explore Laptops",
			buttonLink: "#category/Laptops",
			imageUrl: LOCAL_PHOTOS.heroWorkspace,
			featuredProductId: "prod-lenovo-ideapad-3",
			badgeText: "Official 2Y Warranty",
			animStyle: "orbit"
		},
		{
			id: "slide-3",
			kicker: "Studio Sound & Wearables",
			headline: "Deep Bass ANC Headphones & Smart Fitness Watches",
			subtext: "Crystal-clear calls, 40-hour noise cancellation, and AMOLED health tracking engineered for daily commutes.",
			buttonText: "Shop Audio",
			buttonLink: "#category/Headphones",
			imageUrl: LOCAL_PHOTOS.audioGaming,
			featuredProductId: "prod-anc-headphones",
			badgeText: "40h ANC · Best Seller",
			animStyle: "pulse"
		},
		{
			id: "slide-4",
			kicker: "Pro Gaming & Esports",
			headline: "Low-Latency Controllers & RGB Gaming Precision",
			subtext: "Upgrade your mobile and PC battlestation with tactile wireless gamepads and ultra-lightweight gaming mice.",
			buttonText: "Browse Gaming",
			buttonLink: "#category/Gaming",
			imageUrl: LOCAL_PHOTOS.audioGaming,
			featuredProductId: "prod-wireless-gamepad",
			badgeText: "Zero-Lag Wireless",
			animStyle: "zoom"
		},
		{
			id: "slide-5",
			kicker: "Smart Home & Non-Stop Power",
			headline: "360° Wi-Fi Security & 20,000mAh Fast Power Banks",
			subtext: "Keep your home protected with night-vision smart cameras and stay charged during travel or load-shedding.",
			buttonText: "Explore Smart Home",
			buttonLink: "#category/Smart%20Home",
			imageUrl: LOCAL_PHOTOS.smartDevices,
			featuredProductId: "prod-wifi-security-camera",
			badgeText: "360° Night Vision",
			animStyle: "float"
		},
		{
			id: "slide-6",
			kicker: "Deshi Heritage & Street Style",
			headline: "Breathable Cotton Panjabi & Modern Everyday Sneakers",
			subtext: "Crafted with soft Bangladeshi woven cotton and minimalist everyday comfort built for all seasons.",
			buttonText: "Shop Fashion",
			buttonLink: "#category/Fashion",
			imageUrl: LOCAL_PHOTOS.lifestyleFashion,
			featuredProductId: "prod-cotton-panjabi",
			badgeText: "Trending Lifestyle",
			animStyle: "orbit"
		},
		{
			id: "slide-7",
			kicker: "Pure Harvest & Home Wellness",
			headline: "Raw Sundarban Honey & Natural Living Staples",
			subtext: "Lab-tested purity sealed straight from the hive, alongside soothing LED aroma diffusers for calm evenings.",
			buttonText: "Shop Groceries",
			buttonLink: "#category/Groceries",
			imageUrl: LOCAL_PHOTOS.lifestyleFashion,
			featuredProductId: "prod-premium-honey-500g",
			badgeText: "100% Pure & Verified",
			animStyle: "pulse"
		}
	],
	promoTiles: [
		{
			id: "promo-1",
			title: "Audio & Gaming Gear",
			subtext: "Up to 32% off ANC headphones & controllers",
			buttonText: "Shop Audio",
			link: "#category/Headphones",
			imageUrl: LOCAL_PHOTOS.audioGaming
		},
		{
			id: "promo-2",
			title: "Smart Home & Power",
			subtext: "Cameras, 20000mAh power banks & smart LEDs",
			buttonText: "Explore Tech",
			link: "#category/Smart Home",
			imageUrl: LOCAL_PHOTOS.smartDevices
		},
		{
			id: "promo-3",
			title: "Fashion, Beauty & Books",
			subtext: "Pure cotton Panjabi, sneakers & Bangla classics",
			buttonText: "Browse Lifestyle",
			link: "#category/Fashion",
			imageUrl: LOCAL_PHOTOS.lifestyleFashion
		}
	]
};
export const SEED_ADS_SETTINGS = {
	id: "ads",
	slots: {
		ad_hero_leaderboard: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		},
		ad_mid_rectangle: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		},
		ad_footer_banner: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		},
		ad_side_left: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		},
		ad_side_right: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		},
		ad_product_page: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		},
		ad_blog_post: {
			enabled: false,
			imageUrl: "",
			linkUrl: "",
			htmlCode: ""
		}
	}
};
export const BD_DISTRICTS = [
	"Dhaka",
	"Gazipur",
	"Narayanganj",
	"Chattogram",
	"Sylhet",
	"Rajshahi",
	"Khulna",
	"Barishal",
	"Rangpur",
	"Mymensingh",
	"Cumilla",
	"Bogura",
	"Cox's Bazar",
	"Jessore",
	"Dinajpur",
	"Tangail",
	"Narsingdi",
	"Savar",
	"Faridpur",
	"Noakhali",
	"Feni",
	"Brahmanbaria",
	"Kushtia",
	"Pabna"
];

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IjtBQUNBLFNBQVMsY0FBYyxzQkFBc0I7QUFFN0MsT0FBTyxNQUFNLGtCQUFrQjtDQUM3QjtFQUFFLElBQUk7RUFBYyxNQUFNO0VBQVUsUUFBUTtFQUFPLE1BQU07RUFBTSxVQUFVO0VBQUksV0FBVztDQUFFO0NBQzFGO0VBQUUsSUFBSTtFQUFlLE1BQU07RUFBVyxRQUFRO0VBQVcsTUFBTTtFQUFNLFVBQVU7RUFBSSxXQUFXO0NBQUU7Q0FDaEc7RUFBRSxJQUFJO0VBQWtCLE1BQU07RUFBYyxRQUFRO0VBQVUsTUFBTTtFQUFNLFVBQVU7RUFBSSxXQUFXO0NBQUU7Q0FDckc7RUFBRSxJQUFJO0VBQXFCLE1BQU07RUFBaUIsUUFBUTtFQUFpQixNQUFNO0VBQUssVUFBVTtFQUFJLFdBQVc7Q0FBRTtDQUNqSDtFQUFFLElBQUk7RUFBYyxNQUFNO0VBQVUsUUFBUTtFQUFTLE1BQU07RUFBTSxVQUFVO0VBQUksV0FBVztDQUFFO0NBQzVGO0VBQUUsSUFBSTtFQUFtQixNQUFNO0VBQWUsUUFBUTtFQUFhLE1BQU07RUFBTSxVQUFVO0VBQUksV0FBVztDQUFFO0NBQzFHO0VBQUUsSUFBSTtFQUFrQixNQUFNO0VBQWMsUUFBUTtFQUFlLE1BQU07RUFBTSxVQUFVO0VBQUksV0FBVztDQUFFO0NBQzFHO0VBQUUsSUFBSTtFQUFlLE1BQU07RUFBVyxRQUFRO0VBQVUsTUFBTTtFQUFNLFVBQVU7RUFBSSxXQUFXO0NBQUU7Q0FDL0Y7RUFBRSxJQUFJO0VBQWMsTUFBTTtFQUFxQixRQUFRO0VBQTZCLE1BQU07RUFBTSxVQUFVO0VBQUksV0FBVztDQUFFO0NBQzNIO0VBQUUsSUFBSTtFQUFtQixNQUFNO0VBQW1CLFFBQVE7RUFBZSxNQUFNO0VBQU0sVUFBVTtFQUFJLFdBQVc7Q0FBRztDQUNqSDtFQUFFLElBQUk7RUFBYyxNQUFNO0VBQVUsUUFBUTtFQUFZLE1BQU07RUFBTyxVQUFVO0VBQUksV0FBVztDQUFHO0NBQ2pHO0VBQUUsSUFBSTtFQUFpQixNQUFNO0VBQWlCLFFBQVE7RUFBZ0IsTUFBTTtFQUFNLFVBQVU7RUFBSSxXQUFXO0NBQUc7Q0FDOUc7RUFBRSxJQUFJO0VBQWEsTUFBTTtFQUFTLFFBQVE7RUFBTSxNQUFNO0VBQU0sVUFBVTtFQUFJLFdBQVc7Q0FBRztDQUN4RjtFQUFFLElBQUk7RUFBaUIsTUFBTTtFQUFhLFFBQVE7RUFBZ0IsTUFBTTtFQUFNLFVBQVU7RUFBSSxXQUFXO0NBQUc7QUFDNUc7QUFFQSxPQUFPLE1BQU0sZ0JBQWdCO0NBQzNCO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBbUM7R0FBK0I7R0FBc0M7R0FBeUM7RUFBMEI7RUFDdEwsT0FBTztHQUNMO0lBQUUsS0FBSztJQUFXLE9BQU87R0FBc0I7R0FDL0M7SUFBRSxLQUFLO0lBQWlCLE9BQU87R0FBc0I7R0FDckQ7SUFBRSxLQUFLO0lBQVcsT0FBTztHQUE2QjtHQUN0RDtJQUFFLEtBQUs7SUFBVSxPQUFPO0dBQWlDO0dBQ3pEO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBb0M7RUFDaEU7RUFDQSxTQUFTO0dBQUM7R0FBa0I7R0FBYztFQUFVO0VBQ3BELE1BQU07R0FBQztHQUFTO0dBQVU7R0FBUztHQUFVO0VBQU87RUFDcEQsUUFBUSxDQUFDLGFBQWEsY0FBYyxlQUFlLGlCQUFpQixVQUFVLFdBQVcsQ0FBQztFQUMxRixVQUFVO0VBQ1YsYUFBYSxhQUFhO0VBQzFCLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBaUM7R0FBNkI7R0FBOEI7RUFBaUM7RUFDeEksT0FBTztHQUNMO0lBQUUsS0FBSztJQUFXLE9BQU87R0FBeUI7R0FDbEQ7SUFBRSxLQUFLO0lBQWlCLE9BQU87R0FBYztHQUM3QztJQUFFLEtBQUs7SUFBVyxPQUFPO0dBQVU7R0FDbkM7SUFBRSxLQUFLO0lBQVksT0FBTztHQUFzQztFQUNsRTtFQUNBLFNBQVM7R0FBQztHQUFjO0dBQWU7RUFBWTtFQUNuRCxNQUFNO0dBQUM7R0FBVztHQUFVO0dBQU87R0FBVTtFQUFPO0VBQ3BELFFBQVEsQ0FBQyxlQUFlLHNCQUFzQixVQUFVLGNBQWMsR0FBRyxhQUFhLFFBQVE7RUFDOUYsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQTJCO0dBQThCO0dBQWdDO0VBQTBCO0VBQzlILE9BQU87R0FDTDtJQUFFLEtBQUs7SUFBVyxPQUFPO0dBQXNCO0dBQy9DO0lBQUUsS0FBSztJQUFpQixPQUFPO0dBQWM7R0FDN0M7SUFBRSxLQUFLO0lBQVcsT0FBTztHQUFlO0dBQ3hDO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBd0I7RUFDcEQ7RUFDQSxTQUFTO0dBQUM7R0FBa0I7R0FBZ0I7RUFBZTtFQUMzRCxNQUFNO0dBQUM7R0FBVztHQUFnQjtFQUFjO0VBQ2hELFFBQVEsQ0FBQyxlQUFlLGtCQUFrQixVQUFVLFlBQVksQ0FBQztFQUNqRSxVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBb0M7R0FBb0M7R0FBa0M7RUFBc0M7RUFDM0osT0FBTztHQUNMO0lBQUUsS0FBSztJQUFhLE9BQU87R0FBdUI7R0FDbEQ7SUFBRSxLQUFLO0lBQVUsT0FBTztHQUFZO0dBQ3BDO0lBQUUsS0FBSztJQUFXLE9BQU87R0FBcUI7R0FDOUM7SUFBRSxLQUFLO0lBQVcsT0FBTztHQUF3QjtHQUNqRDtJQUFFLEtBQUs7SUFBWSxPQUFPO0dBQW1DO0VBQy9EO0VBQ0EsU0FBUyxDQUFDLGVBQWUsWUFBWTtFQUNyQyxNQUFNO0dBQUM7R0FBVTtHQUFVO0dBQVc7R0FBVztFQUFhO0VBQzlELFFBQVEsQ0FBQyxhQUFhLGVBQWUsZUFBZSx5QkFBeUIsV0FBVyxTQUFTLENBQUM7RUFDbEcsVUFBVTtFQUNWLGFBQWEsYUFBYTtFQUMxQixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQStCO0dBQW1DO0dBQWlDO0VBQThCO0VBQzVJLE9BQU87R0FDTDtJQUFFLEtBQUs7SUFBYSxPQUFPO0dBQW9CO0dBQy9DO0lBQUUsS0FBSztJQUFPLE9BQU87R0FBYTtHQUNsQztJQUFFLEtBQUs7SUFBVyxPQUFPO0dBQXNCO0dBQy9DO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBK0I7RUFDM0Q7RUFDQSxTQUFTLENBQUMsZ0JBQWdCO0VBQzFCLE1BQU07R0FBQztHQUFNO0dBQVU7R0FBVztFQUFnQjtFQUNsRCxRQUFRLENBQUMsZUFBZSxrQkFBa0IsV0FBVyxXQUFXLEdBQUcsYUFBYSxhQUFhO0VBQzdGLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUFvQztHQUF5QjtHQUE2QjtFQUFnQztFQUNySSxPQUFPO0dBQ0w7SUFBRSxLQUFLO0lBQVUsT0FBTztHQUFzQjtHQUM5QztJQUFFLEtBQUs7SUFBVyxPQUFPO0dBQXlDO0dBQ2xFO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBb0I7R0FDOUM7SUFBRSxLQUFLO0lBQVksT0FBTztHQUFnQztFQUM1RDtFQUNBLFNBQVMsQ0FBQyxlQUFlLFdBQVc7RUFDcEMsTUFBTTtHQUFDO0dBQWM7R0FBTztHQUFZO0dBQWE7RUFBTztFQUM1RCxRQUFRLENBQUMsYUFBYSxhQUFhLGVBQWUsa0JBQWtCLGNBQWMsYUFBYSxDQUFDO0VBQ2hHLFVBQVU7RUFDVixhQUFhLGFBQWE7RUFDMUIsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUE2QjtHQUE4QjtHQUF5QjtFQUF5QjtFQUN4SCxPQUFPO0dBQ0w7SUFBRSxLQUFLO0lBQWEsT0FBTztHQUFPO0dBQ2xDO0lBQUUsS0FBSztJQUFjLE9BQU87R0FBTztHQUNuQztJQUFFLEtBQUs7SUFBVyxPQUFPO0dBQWdCO0dBQ3pDO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBb0I7RUFDaEQ7RUFDQSxTQUFTLENBQUMsa0JBQWtCLGFBQWE7RUFDekMsTUFBTTtHQUFDO0dBQU87R0FBVztHQUFhO0VBQU87RUFDN0MsUUFBUSxDQUFDLGVBQWUsbUJBQW1CLGNBQWMsU0FBUyxHQUFHLGFBQWEsV0FBVztFQUM3RixVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBK0I7R0FBMkI7R0FBaUM7RUFBMkI7RUFDakksT0FBTztHQUNMO0lBQUUsS0FBSztJQUFXLE9BQU87R0FBcUI7R0FDOUM7SUFBRSxLQUFLO0lBQW9CLE9BQU87R0FBTztHQUN6QztJQUFFLEtBQUs7SUFBVyxPQUFPO0dBQWdCO0dBQ3pDO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBNkI7RUFDekQ7RUFDQSxTQUFTLENBQUMsa0JBQWtCLFlBQVk7RUFDeEMsTUFBTTtHQUFDO0dBQWM7R0FBVztHQUFVO0VBQWU7RUFDekQsUUFBUSxDQUFDLGFBQWEsVUFBVSxlQUFlLHVCQUF1QixpQkFBaUIsUUFBUSxDQUFDO0VBQ2hHLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUF1QztHQUFtQztHQUFvQztFQUEwQjtFQUNuSixPQUFPO0dBQ0w7SUFBRSxLQUFLO0lBQWlCLE9BQU87R0FBOEI7R0FDN0Q7SUFBRSxLQUFLO0lBQVcsT0FBTztHQUFnQjtHQUN6QztJQUFFLEtBQUs7SUFBWSxPQUFPO0dBQW9CO0VBQ2hEO0VBQ0EsU0FBUyxDQUFDLGlCQUFpQixXQUFXO0VBQ3RDLE1BQU07R0FBQztHQUFXO0dBQWM7R0FBVTtFQUFXO0VBQ3JELFFBQVEsQ0FBQyxhQUFhLGFBQWEsZUFBZSxvQkFBb0IsVUFBVSxZQUFZLENBQUM7RUFDN0YsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQThCO0dBQWtDO0dBQTBCO0VBQXNCO0VBQzNILE9BQU87R0FDTDtJQUFFLEtBQUs7SUFBTyxPQUFPO0dBQWlCO0dBQ3RDO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBb0I7R0FDOUM7SUFBRSxLQUFLO0lBQVUsT0FBTztHQUFNO0VBQ2hDO0VBQ0EsU0FBUyxDQUFDLFNBQVMsT0FBTztFQUMxQixNQUFNO0dBQUM7R0FBUztHQUFnQjtHQUFPO0VBQVM7RUFDaEQsUUFBUSxDQUFDLGVBQWUsb0JBQW9CLFVBQVUsVUFBVSxHQUFHLGFBQWEsV0FBVztFQUMzRixVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBbUM7R0FBaUM7R0FBK0I7RUFBd0I7RUFDdEksT0FBTztHQUNMO0lBQUUsS0FBSztJQUFZLE9BQU87R0FBa0I7R0FDNUM7SUFBRSxLQUFLO0lBQVUsT0FBTztHQUFZO0dBQ3BDO0lBQUUsS0FBSztJQUFTLE9BQU87R0FBcUI7R0FDNUM7SUFBRSxLQUFLO0lBQVksT0FBTztHQUFvQjtFQUNoRDtFQUNBLFNBQVMsQ0FBQyxlQUFlLE9BQU87RUFDaEMsTUFBTTtHQUFDO0dBQWM7R0FBWTtHQUFVO0VBQWE7RUFDeEQsUUFBUSxDQUFDLGFBQWEsY0FBYyxlQUFlLHVCQUF1QixlQUFlLFVBQVUsQ0FBQztFQUNwRyxVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBZ0M7R0FBNkI7R0FBaUM7RUFBcUI7RUFDOUgsT0FBTztHQUNMO0lBQUUsS0FBSztJQUFVLE9BQU87R0FBeUI7R0FDakQ7SUFBRSxLQUFLO0lBQVMsT0FBTztHQUFzQjtHQUM3QztJQUFFLEtBQUs7SUFBWSxPQUFPO0dBQXVCO0VBQ25EO0VBQ0EsU0FBUyxDQUFDLFVBQVU7RUFDcEIsTUFBTTtHQUFDO0dBQVc7R0FBTztHQUFPO0dBQVM7RUFBZ0I7RUFDekQsUUFBUSxDQUFDLGVBQWUsb0JBQW9CLGVBQWUsWUFBWSxDQUFDO0VBQ3hFLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUFnQztHQUErQjtHQUE0QjtFQUFnQjtFQUN0SCxPQUFPO0dBQ0w7SUFBRSxLQUFLO0lBQVUsT0FBTztHQUFVO0dBQ2xDO0lBQUUsS0FBSztJQUFXLE9BQU87R0FBVztHQUNwQztJQUFFLEtBQUs7SUFBYyxPQUFPO0dBQU87RUFDckM7RUFDQSxTQUFTLENBQUMsYUFBYSxVQUFVO0VBQ2pDLE1BQU07R0FBQztHQUFXO0dBQWE7R0FBWTtFQUFPO0VBQ2xELFFBQVEsQ0FBQyxhQUFhLGVBQWUsZUFBZSxxQkFBcUIsY0FBYyxNQUFNLENBQUM7RUFDOUYsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQThCO0dBQTRCO0dBQW1DO0VBQTZCO0VBQ3JJLE9BQU87R0FDTDtJQUFFLEtBQUs7SUFBYyxPQUFPO0dBQW9CO0dBQ2hEO0lBQUUsS0FBSztJQUFXLE9BQU87R0FBc0I7R0FDL0M7SUFBRSxLQUFLO0lBQVksT0FBTztHQUFrQjtFQUM5QztFQUNBLFNBQVMsQ0FBQyxZQUFZO0VBQ3RCLE1BQU07R0FBQztHQUFRO0dBQWdCO0dBQWU7RUFBWTtFQUMxRCxRQUFRLENBQUMsYUFBYSxjQUFjLGVBQWUseUJBQXlCLGNBQWMsU0FBUyxDQUFDO0VBQ3BHLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUErQjtHQUE2QjtHQUFrQztFQUFtQjtFQUM1SCxPQUFPO0dBQ0w7SUFBRSxLQUFLO0lBQVMsT0FBTztHQUFhO0dBQ3BDO0lBQUUsS0FBSztJQUFnQixPQUFPO0dBQWU7R0FDN0M7SUFBRSxLQUFLO0lBQVksT0FBTztHQUFlO0VBQzNDO0VBQ0EsU0FBUyxDQUFDLGFBQWEsU0FBUztFQUNoQyxNQUFNO0dBQUM7R0FBYztHQUFPO0dBQU87RUFBWTtFQUMvQyxRQUFRLENBQUMsZUFBZSxrQkFBa0IsY0FBYyxTQUFTLEdBQUcsYUFBYSxZQUFZO0VBQzdGLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUEyQjtHQUFvQztHQUErQjtFQUE2QjtFQUN0SSxPQUFPO0dBQ0w7SUFBRSxLQUFLO0lBQVksT0FBTztHQUFjO0dBQ3hDO0lBQUUsS0FBSztJQUFPLE9BQU87R0FBc0I7R0FDM0M7SUFBRSxLQUFLO0lBQVEsT0FBTztHQUE4QjtFQUN0RDtFQUNBLFNBQVM7R0FBQztHQUFVO0dBQVU7R0FBVztFQUFVO0VBQ25ELE1BQU07R0FBQztHQUFXO0dBQVc7R0FBVTtHQUFPO0VBQVU7RUFDeEQsUUFBUSxDQUFDLGFBQWEsa0JBQWtCLGVBQWUsMEJBQTBCLFdBQVcsYUFBYSxDQUFDO0VBQzFHLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUEyQjtHQUE0QjtFQUFnQztFQUNsRyxPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQVMsT0FBTztFQUEyQixHQUNsRDtHQUFFLEtBQUs7R0FBUSxPQUFPO0VBQWdCLENBQ3hDO0VBQ0EsU0FBUztHQUFDO0dBQVM7R0FBUztHQUFTO0dBQVM7RUFBTztFQUNyRCxNQUFNO0dBQUM7R0FBWTtHQUFTO0dBQVc7RUFBVTtFQUNqRCxRQUFRLENBQUMsYUFBYSxrQkFBa0IsZUFBZSxtQkFBbUIsV0FBVyxhQUFhLENBQUM7RUFDbkcsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQXNDO0dBQWtCO0dBQWlDO0VBQXlCO0VBQzdILE9BQU8sQ0FDTDtHQUFFLEtBQUs7R0FBVSxPQUFPO0VBQXFCLEdBQzdDO0dBQUUsS0FBSztHQUFhLE9BQU87RUFBaUIsQ0FDOUM7RUFDQSxTQUFTLENBQUMsYUFBYTtFQUN2QixNQUFNO0dBQUM7R0FBUztHQUFZO0dBQVU7R0FBYztFQUFPO0VBQzNELFFBQVEsQ0FBQyxlQUFlLHdCQUF3QixxQkFBcUIsV0FBVyxHQUFHLGFBQWEsZ0JBQWdCO0VBQ2hILFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUF3QjtHQUE0QjtHQUE4QjtFQUFnQztFQUM3SCxPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQVUsT0FBTztFQUE0QixHQUNwRDtHQUFFLEtBQUs7R0FBWSxPQUFPO0VBQXlCLENBQ3JEO0VBQ0EsU0FBUyxDQUFDLGNBQWM7RUFDeEIsTUFBTTtHQUFDO0dBQWE7R0FBUztHQUFlO0dBQVk7RUFBTztFQUMvRCxRQUFRLENBQUMsZUFBZSx1QkFBdUIscUJBQXFCLGFBQWEsR0FBRyxhQUFhLGdCQUFnQjtFQUNqSCxVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBd0I7R0FBNkI7R0FBMEI7RUFBd0I7RUFDbEgsT0FBTyxDQUNMO0dBQUUsS0FBSztHQUFVLE9BQU87RUFBb0IsR0FDNUM7R0FBRSxLQUFLO0dBQWEsT0FBTztFQUEwQixDQUN2RDtFQUNBLFNBQVMsQ0FBQyxhQUFhO0VBQ3ZCLE1BQU07R0FBQztHQUFlO0dBQVM7R0FBZTtHQUFZO0VBQU87RUFDakUsUUFBUSxDQUFDLGVBQWUseUJBQXlCLHFCQUFxQixXQUFXLENBQUM7RUFDbEYsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQXVCO0dBQTBCO0dBQXlCO0VBQW9CO0VBQ3pHLE9BQU8sQ0FDTDtHQUFFLEtBQUs7R0FBYyxPQUFPO0VBQWdCLEdBQzVDO0dBQUUsS0FBSztHQUFhLE9BQU87RUFBMEIsQ0FDdkQ7RUFDQSxTQUFTLENBQUMsU0FBUztFQUNuQixNQUFNO0dBQUM7R0FBUztHQUFhO0dBQWU7R0FBWTtHQUFZO0VBQU87RUFDM0UsUUFBUSxDQUFDLGVBQWUseUJBQXlCLHFCQUFxQixjQUFjLENBQUM7RUFDckYsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQTRCO0dBQWtDO0dBQTBCO0VBQXdCO0VBQzNILE9BQU8sQ0FDTDtHQUFFLEtBQUs7R0FBYyxPQUFPO0VBQVUsR0FDdEM7R0FBRSxLQUFLO0dBQVcsT0FBTztFQUFzQixDQUNqRDtFQUNBLFNBQVMsQ0FBQyxlQUFlO0VBQ3pCLE1BQU07R0FBQztHQUFlO0dBQVM7R0FBVztHQUFZO0dBQVk7RUFBTztFQUN6RSxRQUFRLENBQUMsZUFBZSx1QkFBdUIscUJBQXFCLGNBQWMsQ0FBQztFQUNuRixVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBNkI7R0FBZ0M7R0FBZ0M7RUFBeUI7RUFDakksT0FBTyxDQUNMO0dBQUUsS0FBSztHQUFjLE9BQU87RUFBWSxHQUN4QztHQUFFLEtBQUs7R0FBVSxPQUFPO0VBQWEsQ0FDdkM7RUFDQSxTQUFTLENBQUMsV0FBVztFQUNyQixNQUFNO0dBQUM7R0FBYTtHQUFhO0dBQVU7R0FBWTtFQUFPO0VBQzlELFFBQVEsQ0FBQyxlQUFlLDRCQUE0QixxQkFBcUIsV0FBVyxDQUFDO0VBQ3JGLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUE4QjtHQUE0QjtFQUE2QjtFQUNsRyxPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQVUsT0FBTztFQUFrQixHQUMxQztHQUFFLEtBQUs7R0FBVSxPQUFPO0VBQTJCLENBQ3JEO0VBQ0EsU0FBUztHQUFDO0dBQVk7R0FBYztFQUFZO0VBQ2hELE1BQU07R0FBQztHQUFZO0dBQVU7R0FBVTtFQUFPO0VBQzlDLFFBQVEsQ0FBQyxlQUFlLHdCQUF3QixxQkFBcUIsUUFBUSxDQUFDO0VBQzlFLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUFrQztHQUF3QjtFQUF3QjtFQUM3RixPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQWMsT0FBTztFQUFrQixHQUM5QztHQUFFLEtBQUs7R0FBWSxPQUFPO0VBQXFCLENBQ2pEO0VBQ0EsU0FBUyxDQUFDLGdCQUFnQixjQUFjO0VBQ3hDLE1BQU07R0FBQztHQUFRO0dBQWE7R0FBUTtFQUFRO0VBQzVDLFFBQVEsQ0FBQyxhQUFhLGVBQWUsZUFBZSwwQkFBMEIsbUJBQW1CLFFBQVEsQ0FBQztFQUMxRyxVQUFVO0VBQ1YsYUFBYTtFQUNiLGNBQWM7RUFDZCxjQUFjO0VBQ2QsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osY0FBYztDQUNoQjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE1BQU07RUFDTixNQUFNO0VBQ04sT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxXQUFXO0VBQ1gsS0FBSztFQUNMLFFBQVE7RUFDUixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLGlCQUFpQjtFQUNqQixVQUFVO0dBQUM7R0FBbUM7R0FBaUM7R0FBK0I7RUFBd0I7RUFDdEksT0FBTyxDQUNMO0dBQUUsS0FBSztHQUFZLE9BQU87RUFBUSxHQUNsQztHQUFFLEtBQUs7R0FBUyxPQUFPO0VBQTJCLENBQ3BEO0VBQ0EsU0FBUyxDQUFDLGNBQWMsWUFBWTtFQUNwQyxNQUFNO0dBQUM7R0FBWTtHQUFjO0dBQWU7RUFBTztFQUN2RCxRQUFRLENBQUMsZUFBZSxrQkFBa0IsbUJBQW1CLFlBQVksR0FBRyxhQUFhLGFBQWE7RUFDdEcsVUFBVTtFQUNWLGFBQWE7RUFDYixjQUFjO0VBQ2QsY0FBYztFQUNkLFlBQVk7RUFDWixhQUFhO0VBQ2IsWUFBWTtFQUNaLGNBQWM7Q0FDaEI7Q0FDQTtFQUNFLElBQUk7RUFDSixNQUFNO0VBQ04sTUFBTTtFQUNOLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFVBQVU7RUFDVixPQUFPO0VBQ1AsV0FBVztFQUNYLEtBQUs7RUFDTCxRQUFRO0VBQ1IsYUFBYTtFQUNiLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsVUFBVTtHQUFDO0dBQXVDO0dBQStCO0VBQThCO0VBQy9HLE9BQU8sQ0FDTDtHQUFFLEtBQUs7R0FBZ0IsT0FBTztFQUFrQixHQUNoRDtHQUFFLEtBQUs7R0FBWSxPQUFPO0VBQWlDLENBQzdEO0VBQ0EsU0FBUyxDQUFDLFVBQVU7RUFDcEIsTUFBTTtHQUFDO0dBQVk7R0FBVztHQUFPO0VBQVE7RUFDN0MsUUFBUSxDQUFDLGVBQWUsMkJBQTJCLFVBQVUsZUFBZSxDQUFDO0VBQzdFLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUEyQjtHQUErQjtFQUE2QjtFQUNsRyxPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQVUsT0FBTztFQUFhLEdBQ3JDO0dBQUUsS0FBSztHQUFhLE9BQU87RUFBZSxDQUM1QztFQUNBLFNBQVMsQ0FBQyxhQUFhO0VBQ3ZCLE1BQU07R0FBQztHQUFRO0dBQVE7R0FBVTtFQUFNO0VBQ3ZDLFFBQVEsQ0FBQyxlQUFlLHdCQUF3QixpQkFBaUIsY0FBYyxDQUFDO0VBQ2hGLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUE4QjtHQUE2QjtFQUErQjtFQUNyRyxPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQVksT0FBTztFQUFTLEdBQ25DO0dBQUUsS0FBSztHQUFXLE9BQU87RUFBb0IsQ0FDL0M7RUFDQSxTQUFTLENBQUMsZ0JBQWdCO0VBQzFCLE1BQU07R0FBQztHQUFTO0dBQVU7R0FBUztHQUFXO0VBQU07RUFDcEQsUUFBUSxDQUFDLGFBQWEsa0JBQWtCLGVBQWUsMkJBQTJCLFNBQVMsWUFBWSxDQUFDO0VBQ3hHLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0NBQ0E7RUFDRSxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixPQUFPO0VBQ1AsVUFBVTtFQUNWLE9BQU87RUFDUCxVQUFVO0VBQ1YsT0FBTztFQUNQLFdBQVc7RUFDWCxLQUFLO0VBQ0wsUUFBUTtFQUNSLGFBQWE7RUFDYixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLFVBQVU7R0FBQztHQUFnQztHQUErQjtFQUEyQjtFQUNyRyxPQUFPLENBQ0w7R0FBRSxLQUFLO0dBQWMsT0FBTztFQUFPLEdBQ25DO0dBQUUsS0FBSztHQUFVLE9BQU87RUFBZ0MsQ0FDMUQ7RUFDQSxTQUFTLENBQUMsZ0JBQWdCO0VBQzFCLE1BQU07R0FBQztHQUFTO0dBQVc7R0FBYTtHQUFhO0VBQU07RUFDM0QsUUFBUSxDQUFDLGVBQWUsc0JBQXNCLGFBQWEsV0FBVyxHQUFHLGFBQWEsZ0JBQWdCO0VBQ3RHLFVBQVU7RUFDVixhQUFhO0VBQ2IsY0FBYztFQUNkLGNBQWM7RUFDZCxZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixjQUFjO0NBQ2hCO0FBQ0Y7QUFFQSxPQUFPLE1BQU0sZUFBZTtDQUMxQjtFQUNFLElBQUk7RUFDSixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVU7RUFDVixTQUFTO0NBQ1g7Q0FDQTtFQUNFLElBQUk7RUFDSixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVU7RUFDVixTQUFTO0NBQ1g7Q0FDQTtFQUNFLElBQUk7RUFDSixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVU7RUFDVixTQUFTO0NBQ1g7Q0FDQTtFQUNFLElBQUk7RUFDSixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVU7RUFDVixTQUFTO0NBQ1g7Q0FDQTtFQUNFLElBQUk7RUFDSixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVU7RUFDVixTQUFTO0NBQ1g7Q0FDQTtFQUNFLElBQUk7RUFDSixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixNQUFNO0VBQ04sUUFBUTtFQUNSLFVBQVU7RUFDVixTQUFTO0NBQ1g7QUFDRjtBQUVBLE9BQU8sTUFBTSxhQUFhO0NBQ3hCO0VBQ0UsSUFBSTtFQUNKLE9BQU87RUFDUCxNQUFNO0VBQ04sVUFBVTtFQUNWLFlBQVksYUFBYTtFQUN6QixTQUFTO0VBQ1QsTUFBTTtFQUNOLE1BQU07R0FBQztHQUFlO0dBQWdCO0VBQVk7RUFDbEQsV0FBVztDQUNiO0NBQ0E7RUFDRSxJQUFJO0VBQ0osT0FBTztFQUNQLE1BQU07RUFDTixVQUFVO0VBQ1YsWUFBWSxhQUFhO0VBQ3pCLFNBQVM7RUFDVCxNQUFNO0VBQ04sTUFBTTtHQUFDO0dBQVU7R0FBZTtFQUFXO0VBQzNDLFdBQVc7Q0FDYjtDQUNBO0VBQ0UsSUFBSTtFQUNKLE9BQU87RUFDUCxNQUFNO0VBQ04sVUFBVTtFQUNWLFlBQVksYUFBYTtFQUN6QixTQUFTO0VBQ1QsTUFBTTtFQUNOLE1BQU07R0FBQztHQUFPO0dBQVM7R0FBUztFQUFVO0VBQzFDLFdBQVc7Q0FDYjtBQUNGO0FBRUEsT0FBTyxNQUFNLHdCQUF3QjtDQUNuQyxJQUFJO0NBQ0osVUFBVTtDQUNWLFNBQVM7Q0FDVCxTQUFTO0NBQ1QsWUFBWTtDQUNaLE9BQU87Q0FDUCxVQUFVO0NBQ1YsT0FBTztDQUNQLFNBQVM7Q0FDVCxhQUFhO0NBQ2IsY0FBYztDQUNkLFlBQVk7Q0FDWixnQkFBZ0I7Q0FDaEIsaUJBQWlCO0NBQ2pCLGlCQUFpQjtDQUNqQixnQkFBZ0I7Q0FDaEIsWUFBWTtDQUNaLGFBQWE7Q0FDYixlQUFlO0NBQ2YsZUFBZTtDQUNmLGdCQUFnQjtDQUNoQixZQUFZO0NBQ1osaUJBQWlCO0FBQ25CO0FBRUEsT0FBTyxNQUFNLHNCQUFzQjtDQUNqQyxJQUFJO0NBQ0osYUFBYTtDQUNiLGNBQWM7Q0FDZCxhQUFhO0NBQ2IsU0FBUztDQUNULFlBQVk7RUFDVjtHQUNFLElBQUk7R0FDSixRQUFRO0dBQ1IsVUFBVTtHQUNWLFNBQVM7R0FDVCxZQUFZO0dBQ1osWUFBWTtHQUNaLFVBQVUsYUFBYTtHQUN2QixtQkFBbUI7R0FDbkIsV0FBVztHQUNYLFdBQVc7RUFDYjtFQUNBO0dBQ0UsSUFBSTtHQUNKLFFBQVE7R0FDUixVQUFVO0dBQ1YsU0FBUztHQUNULFlBQVk7R0FDWixZQUFZO0dBQ1osVUFBVSxhQUFhO0dBQ3ZCLG1CQUFtQjtHQUNuQixXQUFXO0dBQ1gsV0FBVztFQUNiO0VBQ0E7R0FDRSxJQUFJO0dBQ0osUUFBUTtHQUNSLFVBQVU7R0FDVixTQUFTO0dBQ1QsWUFBWTtHQUNaLFlBQVk7R0FDWixVQUFVLGFBQWE7R0FDdkIsbUJBQW1CO0dBQ25CLFdBQVc7R0FDWCxXQUFXO0VBQ2I7RUFDQTtHQUNFLElBQUk7R0FDSixRQUFRO0dBQ1IsVUFBVTtHQUNWLFNBQVM7R0FDVCxZQUFZO0dBQ1osWUFBWTtHQUNaLFVBQVUsYUFBYTtHQUN2QixtQkFBbUI7R0FDbkIsV0FBVztHQUNYLFdBQVc7RUFDYjtFQUNBO0dBQ0UsSUFBSTtHQUNKLFFBQVE7R0FDUixVQUFVO0dBQ1YsU0FBUztHQUNULFlBQVk7R0FDWixZQUFZO0dBQ1osVUFBVSxhQUFhO0dBQ3ZCLG1CQUFtQjtHQUNuQixXQUFXO0dBQ1gsV0FBVztFQUNiO0VBQ0E7R0FDRSxJQUFJO0dBQ0osUUFBUTtHQUNSLFVBQVU7R0FDVixTQUFTO0dBQ1QsWUFBWTtHQUNaLFlBQVk7R0FDWixVQUFVLGFBQWE7R0FDdkIsbUJBQW1CO0dBQ25CLFdBQVc7R0FDWCxXQUFXO0VBQ2I7RUFDQTtHQUNFLElBQUk7R0FDSixRQUFRO0dBQ1IsVUFBVTtHQUNWLFNBQVM7R0FDVCxZQUFZO0dBQ1osWUFBWTtHQUNaLFVBQVUsYUFBYTtHQUN2QixtQkFBbUI7R0FDbkIsV0FBVztHQUNYLFdBQVc7RUFDYjtDQUNGO0NBQ0EsWUFBWTtFQUNWO0dBQ0UsSUFBSTtHQUNKLE9BQU87R0FDUCxTQUFTO0dBQ1QsWUFBWTtHQUNaLE1BQU07R0FDTixVQUFVLGFBQWE7RUFDekI7RUFDQTtHQUNFLElBQUk7R0FDSixPQUFPO0dBQ1AsU0FBUztHQUNULFlBQVk7R0FDWixNQUFNO0dBQ04sVUFBVSxhQUFhO0VBQ3pCO0VBQ0E7R0FDRSxJQUFJO0dBQ0osT0FBTztHQUNQLFNBQVM7R0FDVCxZQUFZO0dBQ1osTUFBTTtHQUNOLFVBQVUsYUFBYTtFQUN6QjtDQUNGO0FBQ0Y7QUFFQSxPQUFPLE1BQU0sb0JBQW9CO0NBQy9CLElBQUk7Q0FDSixPQUFPO0VBQ0wscUJBQXFCO0dBQUUsU0FBUztHQUFPLFVBQVU7R0FBSSxTQUFTO0dBQUksVUFBVTtFQUFHO0VBQy9FLGtCQUFrQjtHQUFFLFNBQVM7R0FBTyxVQUFVO0dBQUksU0FBUztHQUFJLFVBQVU7RUFBRztFQUM1RSxrQkFBa0I7R0FBRSxTQUFTO0dBQU8sVUFBVTtHQUFJLFNBQVM7R0FBSSxVQUFVO0VBQUc7RUFDNUUsY0FBYztHQUFFLFNBQVM7R0FBTyxVQUFVO0dBQUksU0FBUztHQUFJLFVBQVU7RUFBRztFQUN4RSxlQUFlO0dBQUUsU0FBUztHQUFPLFVBQVU7R0FBSSxTQUFTO0dBQUksVUFBVTtFQUFHO0VBQ3pFLGlCQUFpQjtHQUFFLFNBQVM7R0FBTyxVQUFVO0dBQUksU0FBUztHQUFJLFVBQVU7RUFBRztFQUMzRSxjQUFjO0dBQUUsU0FBUztHQUFPLFVBQVU7R0FBSSxTQUFTO0dBQUksVUFBVTtFQUFHO0NBQzFFO0FBQ0Y7QUFFQSxPQUFPLE1BQU0sZUFBZTtDQUMxQjtDQUFTO0NBQVc7Q0FBZTtDQUFjO0NBQVU7Q0FDM0Q7Q0FBVTtDQUFZO0NBQVc7Q0FBYztDQUFXO0NBQzFEO0NBQWdCO0NBQVc7Q0FBWTtDQUFXO0NBQWE7Q0FDL0Q7Q0FBWTtDQUFZO0NBQVE7Q0FBZ0I7Q0FBVztBQUM3RCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJzZWVkLWRhdGEuanMiXSwidmVyc2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiLy8gUGF6YXJvIEJEIOKAlCBDb21wbGV0ZSBEZW1vIFNlZWQgRGF0YSAoQmFuZ2xhZGVzaCBNYXJrZXQsIFByaWNlcyBpbiDgp7MpXG5pbXBvcnQgeyBMT0NBTF9QSE9UT1MsIG1ha2VQcm9kdWN0U3ZnIH0gZnJvbSAnLi9wcm9kdWN0LWFydC5qcyc7XG5cbmV4cG9ydCBjb25zdCBTRUVEX0NBVEVHT1JJRVMgPSBbXG4gIHsgaWQ6ICdjYXQtcGhvbmVzJywgbmFtZTogJ1Bob25lcycsIG5hbWVCbjogJ+Cmq+Cni+CmqCcsIGljb246ICfwn5OxJywgaW1hZ2VVcmw6ICcnLCBzb3J0T3JkZXI6IDEgfSxcbiAgeyBpZDogJ2NhdC1sYXB0b3BzJywgbmFtZTogJ0xhcHRvcHMnLCBuYW1lQm46ICfgprLgp43gpq/gpr7gpqrgpp/gpqonLCBpY29uOiAn8J+SuycsIGltYWdlVXJsOiAnJywgc29ydE9yZGVyOiAyIH0sXG4gIHsgaWQ6ICdjYXQtaGVhZHBob25lcycsIG5hbWU6ICdIZWFkcGhvbmVzJywgbmFtZUJuOiAn4Ka54KeH4Kah4Kar4KeL4KaoJywgaWNvbjogJ/CfjqcnLCBpbWFnZVVybDogJycsIHNvcnRPcmRlcjogMyB9LFxuICB7IGlkOiAnY2F0LXNtYXJ0LXdhdGNoZXMnLCBuYW1lOiAnU21hcnQgV2F0Y2hlcycsIG5hbWVCbjogJ+CmuOCnjeCmruCmvuCmsOCnjeCmnyDgppPgpq/gprzgpr7gpponLCBpY29uOiAn4oyaJywgaW1hZ2VVcmw6ICcnLCBzb3J0T3JkZXI6IDQgfSxcbiAgeyBpZDogJ2NhdC1nYW1pbmcnLCBuYW1lOiAnR2FtaW5nJywgbmFtZUJuOiAn4KaX4KeH4Kau4Ka/4KaCJywgaWNvbjogJ/Cfjq4nLCBpbWFnZVVybDogJycsIHNvcnRPcmRlcjogNSB9LFxuICB7IGlkOiAnY2F0LWFjY2Vzc29yaWVzJywgbmFtZTogJ0FjY2Vzc29yaWVzJywgbmFtZUJuOiAn4KaP4KaV4KeN4Ka44KeH4Ka44Kaw4Ka/4KacJywgaWNvbjogJ/CflIsnLCBpbWFnZVVybDogJycsIHNvcnRPcmRlcjogNiB9LFxuICB7IGlkOiAnY2F0LXNtYXJ0LWhvbWUnLCBuYW1lOiAnU21hcnQgSG9tZScsIG5hbWVCbjogJ+CmuOCnjeCmruCmvuCmsOCnjeCmnyDgprngp4vgpq4nLCBpY29uOiAn8J+PoCcsIGltYWdlVXJsOiAnJywgc29ydE9yZGVyOiA3IH0sXG4gIHsgaWQ6ICdjYXQtZmFzaGlvbicsIG5hbWU6ICdGYXNoaW9uJywgbmFtZUJuOiAn4Kar4KeN4Kav4Ka+4Ka24KaoJywgaWNvbjogJ/CfkZUnLCBpbWFnZVVybDogJycsIHNvcnRPcmRlcjogOCB9LFxuICB7IGlkOiAnY2F0LWJlYXV0eScsIG5hbWU6ICdCZWF1dHkgJiBTa2luY2FyZScsIG5hbWVCbjogJ+CmrOCmv+CmieCmn+Cmvywg4Ka44KeN4KaV4Ka/4Kao4KaV4KeH4Kef4Ka+4KawIOCmkyDgprjgpr/gprDgpr7gpq4nLCBpY29uOiAn8J+ntCcsIGltYWdlVXJsOiAnJywgc29ydE9yZGVyOiA5IH0sXG4gIHsgaWQ6ICdjYXQtaG9tZS1saXZpbmcnLCBuYW1lOiAnSG9tZSBhbmQgTGl2aW5nJywgbmFtZUJuOiAn4Ka54KeL4KauIOCmkyDgprLgpr/gpq3gpr/gpoInLCBpY29uOiAn8J+qtCcsIGltYWdlVXJsOiAnJywgc29ydE9yZGVyOiAxMCB9LFxuICB7IGlkOiAnY2F0LXNwb3J0cycsIG5hbWU6ICdTcG9ydHMnLCBuYW1lQm46ICfgprjgp43gpqrgp4vgprDgp43gpp/gprgnLCBpY29uOiAn8J+Pi++4jycsIGltYWdlVXJsOiAnJywgc29ydE9yZGVyOiAxMSB9LFxuICB7IGlkOiAnY2F0LXRveXMta2lkcycsIG5hbWU6ICdUb3lzIGFuZCBLaWRzJywgbmFtZUJuOiAn4KaW4KeH4Kay4Kao4Ka+IOCmkyDgprbgpr/gprbgp4EnLCBpY29uOiAn8J+nuCcsIGltYWdlVXJsOiAnJywgc29ydE9yZGVyOiAxMiB9LFxuICB7IGlkOiAnY2F0LWJvb2tzJywgbmFtZTogJ0Jvb2tzJywgbmFtZUJuOiAn4Kas4KaHJywgaWNvbjogJ/Cfk5onLCBpbWFnZVVybDogJycsIHNvcnRPcmRlcjogMTMgfSxcbiAgeyBpZDogJ2NhdC1ncm9jZXJpZXMnLCBuYW1lOiAnR3JvY2VyaWVzJywgbmFtZUJuOiAn4Kau4KeB4Kam4Ka/IOCmuOCmvuCmruCml+CnjeCmsOCngCcsIGljb246ICfwn42vJywgaW1hZ2VVcmw6ICcnLCBzb3J0T3JkZXI6IDE0IH1cbl07XG5cbmV4cG9ydCBjb25zdCBTRUVEX1BST0RVQ1RTID0gW1xuICB7XG4gICAgaWQ6ICdwcm9kLXJlZG1pLW5vdGUtMTMnLFxuICAgIG5hbWU6ICdSZWRtaSBOb3RlIDEzICg4R0IvMTI4R0IpJyxcbiAgICBzbHVnOiAncmVkbWktbm90ZS0xMy04Z2ItMTI4Z2InLFxuICAgIGJyYW5kOiAnWGlhb21pJyxcbiAgICBjYXRlZ29yeTogJ1Bob25lcycsXG4gICAgcHJpY2U6IDIxNTAwLFxuICAgIG9sZFByaWNlOiAyNDAwMCxcbiAgICBzdG9jazogMjgsXG4gICAgdW5pdHNTb2xkOiA2NCxcbiAgICBza3U6ICdQWi1QSC0xMDEnLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiAxNDIsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJzEyMEh6IEFNT0xFRCBkaXNwbGF5LCAxMDhNUCB0cmlwbGUgY2FtZXJhLCBTbmFwZHJhZ29uIHByb2Nlc3NvciAmIDMzVyBmYXN0IGNoYXJnaW5nLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnRXhwZXJpZW5jZSBmbGFnc2hpcC1ncmFkZSBjbGFyaXR5IHdpdGggdGhlIFJlZG1pIE5vdGUgMTMgZmVhdHVyaW5nIGEgdml2aWQgNi42Ny1pbmNoIDEyMEh6IEFNT0xFRCBzY3JlZW4sIDEwOE1QIHVsdHJhLWNsZWFyIG1haW4gY2FtZXJhLCBhbmQgYSBsb25nLWxhc3RpbmcgNTAwMG1BaCBiYXR0ZXJ5IGVuZ2luZWVyZWQgZm9yIGFsbC1kYXkgcGVyZm9ybWFuY2UgYWNyb3NzIEJhbmdsYWRlc2guJyxcbiAgICBmZWF0dXJlczogWyc2LjY3XCIgMTIwSHogRkhEKyBBTU9MRUQgRGlzcGxheScsICcxMDhNUCBQcm8tR3JhZGUgTWFpbiBDYW1lcmEnLCAnU25hcGRyYWdvbiA2ODUgT2N0YS1Db3JlIFByb2Nlc3NvcicsICc1MDAwbUFoIEJhdHRlcnkgd2l0aCAzM1cgVHVyYm8gQ2hhcmdlJywgJ09mZmljaWFsIDEtWWVhciBXYXJyYW50eSddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ0Rpc3BsYXknLCB2YWx1ZTogJzYuNjdcIiBBTU9MRUQsIDEyMEh6JyB9LFxuICAgICAgeyBrZXk6ICdSQU0gJiBTdG9yYWdlJywgdmFsdWU6ICc4R0IgUkFNIC8gMTI4R0IgUk9NJyB9LFxuICAgICAgeyBrZXk6ICdCYXR0ZXJ5JywgdmFsdWU6ICc1MDAwbUFoLCAzM1cgRmFzdCBDaGFyZ2luZycgfSxcbiAgICAgIHsga2V5OiAnQ2FtZXJhJywgdmFsdWU6ICcxMDhNUCArIDhNUCArIDJNUCAvIDE2TVAgRnJvbnQnIH0sXG4gICAgICB7IGtleTogJ1dhcnJhbnR5JywgdmFsdWU6ICcxMiBNb250aHMgT2ZmaWNpYWwgQnJhbmQgV2FycmFudHknIH1cbiAgICBdLFxuICAgIG9wdGlvbnM6IFsnTWlkbmlnaHQgQmxhY2snLCAnTWludCBHcmVlbicsICdJY2UgQmx1ZSddLFxuICAgIHRhZ3M6IFsncGhvbmUnLCAneGlhb21pJywgJ3JlZG1pJywgJ2Ftb2xlZCcsICcxMDhtcCddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5zbWFydERldmljZXMsIG1ha2VQcm9kdWN0U3ZnKCdSZWRtaSBOb3RlIDEzJywgJ1Bob25lcycsICc4R0IvMTI4R0InKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiBMT0NBTF9QSE9UT1MuaGVyb1RlY2gsXG4gICAgZGVsaXZlcnlJbmZvOiAnSW5zaWRlIERoYWthIDI0LTQ4IGhvdXJzICjgp7M2MCkuIE91dHNpZGUgRGhha2EgMi00IGRheXMgKOCnszEyMCkuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSBlYXN5IHJlcGxhY2VtZW50IGZvciBmYWN0b3J5IGRlZmVjdHMgd2l0aCBzZWFsZWQgYm94LicsXG4gICAgaXNGZWF0dXJlZDogdHJ1ZSxcbiAgICBpc0ZsYXNoU2FsZTogdHJ1ZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1zYW1zdW5nLWExNScsXG4gICAgbmFtZTogJ1NhbXN1bmcgR2FsYXh5IEExNScsXG4gICAgc2x1ZzogJ3NhbXN1bmctZ2FsYXh5LWExNScsXG4gICAgYnJhbmQ6ICdTYW1zdW5nJyxcbiAgICBjYXRlZ29yeTogJ1Bob25lcycsXG4gICAgcHJpY2U6IDIyOTAwLFxuICAgIG9sZFByaWNlOiAyNTUwMCxcbiAgICBzdG9jazogMjIsXG4gICAgdW5pdHNTb2xkOiA1MSxcbiAgICBza3U6ICdQWi1QSC0xMDInLFxuICAgIHJhdGluZzogNC43LFxuICAgIHJldmlld0NvdW50OiA5OCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnU3VwZXIgQU1PTEVEIDkwSHogZGlzcGxheSwgNTBNUCBtYWluIGxlbnMsIEhlbGlvIEc5OSAmIFNhbXN1bmcgS25veCBzZWN1cml0eS4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ1RoZSBTYW1zdW5nIEdhbGF4eSBBMTUgYnJpbmdzIHZpYnJhbnQgU3VwZXIgQU1PTEVEIGJyaWdodG5lc3Mgb3V0ZG9vcnMsIHNtb290aCA5MEh6IHNjcm9sbGluZywgNCBnZW5lcmF0aW9ucyBvZiBPUyB1cGdyYWRlcywgYW5kIGRlcGVuZGFibGUgNTAwMG1BaCBiYXR0ZXJ5IGVuZHVyYW5jZS4nLFxuICAgIGZlYXR1cmVzOiBbJzYuNVwiIFN1cGVyIEFNT0xFRCA5MEh6IFNjcmVlbicsICc1ME1QIFRyaXBsZSBDYW1lcmEgU3lzdGVtJywgJ01lZGlhVGVrIEhlbGlvIEc5OSBDaGlwc2V0JywgJzI1VyBTdXBlciBGYXN0IENoYXJnaW5nIFN1cHBvcnQnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdEaXNwbGF5JywgdmFsdWU6ICc2LjVcIiBTdXBlciBBTU9MRUQgOTBIeicgfSxcbiAgICAgIHsga2V5OiAnUkFNICYgU3RvcmFnZScsIHZhbHVlOiAnNkdCIC8gMTI4R0InIH0sXG4gICAgICB7IGtleTogJ0JhdHRlcnknLCB2YWx1ZTogJzUwMDBtQWgnIH0sXG4gICAgICB7IGtleTogJ1dhcnJhbnR5JywgdmFsdWU6ICcxIFllYXIgT2ZmaWNpYWwgU2Ftc3VuZyBCRCBXYXJyYW50eScgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydCbHVlIEJsYWNrJywgJ0JyYXZlIEJsYWNrJywgJ0xpZ2h0IEJsdWUnXSxcbiAgICB0YWdzOiBbJ3NhbXN1bmcnLCAnZ2FsYXh5JywgJ2ExNScsICdhbW9sZWQnLCAncGhvbmUnXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnU2Ftc3VuZyBHYWxheHkgQTE1JywgJ1Bob25lcycsICdTdXBlciBBTU9MRUQnKSwgTE9DQUxfUEhPVE9TLmhlcm9UZWNoXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ0Zhc3QgbmF0aW9ud2lkZSBkZWxpdmVyeSB3aXRoIENhc2ggb24gRGVsaXZlcnkuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3IGRheXMgZWFzeSByZXR1cm4gb24gdW5vcGVuZWQgb3IgZGVmZWN0aXZlIGl0ZW1zLicsXG4gICAgaXNGZWF0dXJlZDogdHJ1ZSxcbiAgICBpc0ZsYXNoU2FsZTogZmFsc2UsXG4gICAgaXNUcmVuZGluZzogdHJ1ZSxcbiAgICBpc05ld0Fycml2YWw6IHRydWVcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1pbmZpbml4LWhvdC00MCcsXG4gICAgbmFtZTogJ0luZmluaXggSG90IDQwJyxcbiAgICBzbHVnOiAnaW5maW5peC1ob3QtNDAnLFxuICAgIGJyYW5kOiAnSW5maW5peCcsXG4gICAgY2F0ZWdvcnk6ICdQaG9uZXMnLFxuICAgIHByaWNlOiAxNDUwMCxcbiAgICBvbGRQcmljZTogMTY1MDAsXG4gICAgc3RvY2s6IDM2LFxuICAgIHVuaXRzU29sZDogNzgsXG4gICAgc2t1OiAnUFotUEgtMTAzJyxcbiAgICByYXRpbmc6IDQuNSxcbiAgICByZXZpZXdDb3VudDogODQsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ0J1ZGdldCBnYW1pbmcgcG93ZXJob3VzZSB3aXRoIDkwSHogRkhEKyBwdW5jaC1ob2xlIGRpc3BsYXkgJiAzM1cgZmFzdCBjaGFyZ2UuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdCdWlsdCBmb3Igc3R1ZGVudHMgYW5kIG1vYmlsZSBnYW1lcnMgaW4gQmFuZ2xhZGVzaCwgdGhlIEluZmluaXggSG90IDQwIHBhY2tzIFhCT09TVCBnYW1pbmcgZW5naW5lLCA1ME1QIEFJIGNhbWVyYSwgZHVhbCBzdGVyZW8gc3BlYWtlcnMsIGFuZCBNYWdpYyBSaW5nIG5vdGlmaWNhdGlvbnMuJyxcbiAgICBmZWF0dXJlczogWyc2Ljc4XCIgRkhEKyA5MEh6IERpc3BsYXknLCAnSGVsaW8gRzg4IEdhbWluZyBQcm9jZXNzb3InLCAnNTBNUCBBSSBDYW1lcmEgKyAzMk1QIFNlbGZpZScsICczM1cgRW5kdXJpbmcgRmFzdCBDaGFyZ2UnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdEaXNwbGF5JywgdmFsdWU6ICc2Ljc4XCIgSVBTIEZIRCsgOTBIeicgfSxcbiAgICAgIHsga2V5OiAnUkFNICYgU3RvcmFnZScsIHZhbHVlOiAnOEdCIC8gMTI4R0InIH0sXG4gICAgICB7IGtleTogJ0JhdHRlcnknLCB2YWx1ZTogJzUwMDBtQWgsIDMzVycgfSxcbiAgICAgIHsga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzEgWWVhciBCcmFuZCBXYXJyYW50eScgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydTdGFyZmFsbCBHcmVlbicsICdIb3Jpem9uIEdvbGQnLCAnU3RhcmxpdCBCbGFjayddLFxuICAgIHRhZ3M6IFsnaW5maW5peCcsICdidWRnZXQgcGhvbmUnLCAnZ2FtaW5nIHBob25lJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ0luZmluaXggSG90IDQwJywgJ1Bob25lcycsICczM1cgQ2hhcmdlJyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnSW5zaWRlIERoYWthIG5leHQtZGF5IGRlbGl2ZXJ5IGF2YWlsYWJsZS4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IGVhc3kgcmVwbGFjZW1lbnQuJyxcbiAgICBpc0ZlYXR1cmVkOiBmYWxzZSxcbiAgICBpc0ZsYXNoU2FsZTogdHJ1ZSxcbiAgICBpc1RyZW5kaW5nOiBmYWxzZSxcbiAgICBpc05ld0Fycml2YWw6IHRydWVcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1sZW5vdm8taWRlYXBhZC0zJyxcbiAgICBuYW1lOiAnTGVub3ZvIElkZWFQYWQgU2xpbSAzIENvcmUgaTUnLFxuICAgIHNsdWc6ICdsZW5vdm8taWRlYXBhZC1zbGltLTMtY29yZS1pNScsXG4gICAgYnJhbmQ6ICdMZW5vdm8nLFxuICAgIGNhdGVnb3J5OiAnTGFwdG9wcycsXG4gICAgcHJpY2U6IDYyMDAwLFxuICAgIG9sZFByaWNlOiA2ODAwMCxcbiAgICBzdG9jazogMTEsXG4gICAgdW5pdHNTb2xkOiAxOSxcbiAgICBza3U6ICdQWi1MUC0yMDEnLFxuICAgIHJhdGluZzogNC45LFxuICAgIHJldmlld0NvdW50OiA0NSxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMTN0aCBHZW4gSW50ZWwgQ29yZSBpNSwgMTZHQiBSQU0sIDUxMkdCIE5WTWUgU1NELCAxNS42XCIgRkhEIEFudGktR2xhcmUuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdTbGltLCBsaWdodHdlaWdodCwgYW5kIHdoaXNwZXItcXVpZXQuIFRoZSBMZW5vdm8gSWRlYVBhZCBTbGltIDMgaGFuZGxlcyBzb2Z0d2FyZSBkZXZlbG9wbWVudCwgZnJlZWxhbmNpbmcsIHN0dWR5LCBhbmQgY3JlYXRpdmUgbXVsdGl0YXNraW5nIGVmZm9ydGxlc3NseSB3aXRoIFJhcGlkIENoYXJnZSBCb29zdC4nLFxuICAgIGZlYXR1cmVzOiBbJ0ludGVsIENvcmUgaTUgMTN0aCBHZW4gUHJvY2Vzc29yJywgJzE2R0IgTFBERFI1IFJBTSAmIDUxMkdCIEdlbjQgU1NEJywgJzE1LjZcIiBGdWxsIEhEIEFudGktR2xhcmUgUGFuZWwnLCAnRG9sYnkgQXVkaW8gJiBQcml2YWN5IFNodXR0ZXIgV2ViY2FtJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnUHJvY2Vzc29yJywgdmFsdWU6ICdJbnRlbCBDb3JlIGk1LTEzNDIwSCcgfSxcbiAgICAgIHsga2V5OiAnTWVtb3J5JywgdmFsdWU6ICcxNkdCIEREUjUnIH0sXG4gICAgICB7IGtleTogJ1N0b3JhZ2UnLCB2YWx1ZTogJzUxMkdCIE0uMiBOVk1lIFNTRCcgfSxcbiAgICAgIHsga2V5OiAnRGlzcGxheScsIHZhbHVlOiAnMTUuNlwiIEZIRCAoMTkyMHgxMDgwKScgfSxcbiAgICAgIHsga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzIgWWVhcnMgT2ZmaWNpYWwgTGVub3ZvIFdhcnJhbnR5JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ0FyY3RpYyBHcmV5JywgJ0FieXNzIEJsdWUnXSxcbiAgICB0YWdzOiBbJ2xhcHRvcCcsICdsZW5vdm8nLCAnaWRlYXBhZCcsICdjb3JlIGk1JywgJ2ZyZWVsYW5jaW5nJ10sXG4gICAgaW1hZ2VzOiBbTE9DQUxfUEhPVE9TLmhlcm9Xb3Jrc3BhY2UsIG1ha2VQcm9kdWN0U3ZnKCdMZW5vdm8gSWRlYVBhZCBTbGltIDMnLCAnTGFwdG9wcycsICdDb3JlIGk1JyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogTE9DQUxfUEhPVE9TLmhlcm9Xb3Jrc3BhY2UsXG4gICAgZGVsaXZlcnlJbmZvOiAnSW5zdXJlZCBjb3VyaWVyIGFjcm9zcyBhbGwgNjQgZGlzdHJpY3RzLicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgRE9BIHJlcGxhY2VtZW50ICsgMiB5ZWFycyBvZmZpY2lhbCB3YXJyYW50eS4nLFxuICAgIGlzRmVhdHVyZWQ6IHRydWUsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IHRydWUsXG4gICAgaXNOZXdBcnJpdmFsOiBmYWxzZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLWhwLTE1cy1yeXplbjUnLFxuICAgIG5hbWU6ICdIUCAxNXMgUnl6ZW4gNScsXG4gICAgc2x1ZzogJ2hwLTE1cy1yeXplbi01JyxcbiAgICBicmFuZDogJ0hQJyxcbiAgICBjYXRlZ29yeTogJ0xhcHRvcHMnLFxuICAgIHByaWNlOiA1ODUwMCxcbiAgICBvbGRQcmljZTogNjQwMDAsXG4gICAgc3RvY2s6IDksXG4gICAgdW5pdHNTb2xkOiAyMyxcbiAgICBza3U6ICdQWi1MUC0yMDInLFxuICAgIHJhdGluZzogNC43LFxuICAgIHJldmlld0NvdW50OiAzOCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnQU1EIFJ5emVuIDUgNzUyMFUsIDhHQiBERFI1LCA1MTJHQiBTU0QsIE1pY3JvLWVkZ2UgRkhEIGRpc3BsYXkuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdFbmdpbmVlcmVkIGZvciByZWxpYWJpbGl0eSBhbmQgYmF0dGVyeSBsb25nZXZpdHksIHRoZSBIUCAxNXMgZGVsaXZlcnMgZmFzdCBldmVyeWRheSBwcm9kdWN0aXZpdHksIGNyaXNwIHZpZGVvIGNhbGxzLCBhbmQgYSBmdWxsLXNpemUga2V5Ym9hcmQgd2l0aCBudW1lcmljIGtleXBhZC4nLFxuICAgIGZlYXR1cmVzOiBbJ0FNRCBSeXplbiA1IDc1MjBVIFByb2Nlc3NvcicsICc4R0IgTFBERFI1IFJBTSArIDUxMkdCIE5WTWUgU1NEJywgJ0hQIFRydWUgVmlzaW9uIDcyMHAgSEQgQ2FtZXJhJywgJ1VwIHRvIDkuNSBIb3VycyBCYXR0ZXJ5IExpZmUnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdQcm9jZXNzb3InLCB2YWx1ZTogJ0FNRCBSeXplbiA1IDc1MjBVJyB9LFxuICAgICAgeyBrZXk6ICdSQU0nLCB2YWx1ZTogJzhHQiBMUEREUjUnIH0sXG4gICAgICB7IGtleTogJ1N0b3JhZ2UnLCB2YWx1ZTogJzUxMkdCIFBDSWUgTlZNZSBTU0QnIH0sXG4gICAgICB7IGtleTogJ1dhcnJhbnR5JywgdmFsdWU6ICcyIFllYXJzIEhQIE9mZmljaWFsIFdhcnJhbnR5JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ05hdHVyYWwgU2lsdmVyJ10sXG4gICAgdGFnczogWydocCcsICdsYXB0b3AnLCAncnl6ZW4gNScsICdzdHVkZW50IGxhcHRvcCddLFxuICAgIGltYWdlczogW21ha2VQcm9kdWN0U3ZnKCdIUCAxNXMgUnl6ZW4gNScsICdMYXB0b3BzJywgJzUxMkdCIFNTRCcpLCBMT0NBTF9QSE9UT1MuaGVyb1dvcmtzcGFjZV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdGcmVlIERoYWthIGV4cHJlc3MgZGVsaXZlcnkuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXBsYWNlbWVudCBndWFyYW50ZWUuJyxcbiAgICBpc0ZlYXR1cmVkOiB0cnVlLFxuICAgIGlzRmxhc2hTYWxlOiB0cnVlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1hbmMtaGVhZHBob25lcycsXG4gICAgbmFtZTogJ1dpcmVsZXNzIE5vaXNlIENhbmNlbGxpbmcgSGVhZHBob25lcycsXG4gICAgc2x1ZzogJ3dpcmVsZXNzLW5vaXNlLWNhbmNlbGxpbmctaGVhZHBob25lcycsXG4gICAgYnJhbmQ6ICdTb3VuZENvcmUgUHJvJyxcbiAgICBjYXRlZ29yeTogJ0hlYWRwaG9uZXMnLFxuICAgIHByaWNlOiAzNDkwLFxuICAgIG9sZFByaWNlOiA0NTAwLFxuICAgIHN0b2NrOiA0MixcbiAgICB1bml0c1NvbGQ6IDg3LFxuICAgIHNrdTogJ1BaLUFVLTMwMScsXG4gICAgcmF0aW5nOiA0LjgsXG4gICAgcmV2aWV3Q291bnQ6IDExNixcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnSHlicmlkIEFOQyB1cCB0byA0MGRCLCA1MC1ob3VyIHBsYXl0aW1lLCBwbHVzaCBtZW1vcnktZm9hbSBlYXJjdXBzICYgQmx1ZXRvb3RoIDUuMy4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ1NpbGVuY2UgRGhha2EgdHJhZmZpYyBhbmQgZm9jdXMgZGVlcGx5IG9uIGNhbGxzLCBtdXNpYywgb3IgZ2FtaW5nLiBTdXBwb3J0cyBkdWFsLWRldmljZSBtdWx0aXBvaW50IHBhaXJpbmcgYW5kIFVTQi1DIHF1aWNrIGNoYXJnaW5nICg1IG1pbnMgPSA0IGhvdXJzIGxpc3RlbmluZykuJyxcbiAgICBmZWF0dXJlczogWydIeWJyaWQgQWN0aXZlIE5vaXNlIENhbmNlbGxhdGlvbicsICc1MCBIb3VycyBCYXR0ZXJ5IExpZmUnLCAnRHVhbC1EZXZpY2UgQmx1ZXRvb3RoIDUuMycsICdGb2xkYWJsZSBUcmF2ZWwgUG91Y2ggSW5jbHVkZWQnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdEcml2ZXInLCB2YWx1ZTogJzQwbW0gRHluYW1pYyBIaS1SZXMnIH0sXG4gICAgICB7IGtleTogJ0JhdHRlcnknLCB2YWx1ZTogJzUwIEhvdXJzIChBTkMgT2ZmKSAvIDM4IEhvdXJzIChBTkMgT24pJyB9LFxuICAgICAgeyBrZXk6ICdDaGFyZ2luZycsIHZhbHVlOiAnVVNCLUMgRmFzdCBDaGFyZ2UnIH0sXG4gICAgICB7IGtleTogJ1dhcnJhbnR5JywgdmFsdWU6ICc2IE1vbnRocyBSZXBsYWNlbWVudCBXYXJyYW50eScgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydNYXR0ZSBCbGFjaycsICdTYW5kc3RvbmUnXSxcbiAgICB0YWdzOiBbJ2hlYWRwaG9uZXMnLCAnYW5jJywgJ3dpcmVsZXNzJywgJ2JsdWV0b290aCcsICdhdWRpbyddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5hdWRpb0dhbWluZywgbWFrZVByb2R1Y3RTdmcoJ0FOQyBIZWFkcGhvbmVzJywgJ0hlYWRwaG9uZXMnLCAnNTBIIEJhdHRlcnknKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiBMT0NBTF9QSE9UT1MuaGVyb1RlY2gsXG4gICAgZGVsaXZlcnlJbmZvOiAnSW5zaWRlIERoYWthIDI0aCBkZWxpdmVyeS4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IGVhc3kgcmV0dXJuLicsXG4gICAgaXNGZWF0dXJlZDogdHJ1ZSxcbiAgICBpc0ZsYXNoU2FsZTogdHJ1ZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC10d3MtZWFyYnVkcy1wcm8nLFxuICAgIG5hbWU6ICdUV1MgRWFyYnVkcyBQcm8nLFxuICAgIHNsdWc6ICd0d3MtZWFyYnVkcy1wcm8nLFxuICAgIGJyYW5kOiAnUUNZJyxcbiAgICBjYXRlZ29yeTogJ0hlYWRwaG9uZXMnLFxuICAgIHByaWNlOiAxMjkwLFxuICAgIG9sZFByaWNlOiAxODkwLFxuICAgIHN0b2NrOiA2OCxcbiAgICB1bml0c1NvbGQ6IDEzNCxcbiAgICBza3U6ICdQWi1BVS0zMDInLFxuICAgIHJhdGluZzogNC42LFxuICAgIHJldmlld0NvdW50OiAxNzUsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ0VOQyBxdWFkLW1pYyBjbGVhciBjYWxsaW5nLCBJUFg1IHN3ZWF0cHJvb2YgJiAyOGggcG9ja2V0IGNoYXJnaW5nIGNhc2UuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdVbHRyYS1saWdodHdlaWdodCBpbi1lYXIgVFdTIGVhcmJ1ZHMgd2l0aCBwdW5jaHkgYmFzcywgbG93LWxhdGVuY3kgZ2FtaW5nIG1vZGUsIGFuZCBjcnlzdGFsLWNsZWFyIGNhbGwgbm9pc2UgcmVkdWN0aW9uLicsXG4gICAgZmVhdHVyZXM6IFsnUXVhZC1NaWMgRU5DIENhbGwgQ2xhcml0eScsICc2NW1zIExvdy1MYXRlbmN5IEdhbWUgTW9kZScsICdJUFg1IFdhdGVyIFJlc2lzdGFuY2UnLCAnMjggSG91cnMgVG90YWwgUGxheXRpbWUnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdCbHVldG9vdGgnLCB2YWx1ZTogJ3Y1LjMnIH0sXG4gICAgICB7IGtleTogJ1dhdGVycHJvb2YnLCB2YWx1ZTogJ0lQWDUnIH0sXG4gICAgICB7IGtleTogJ0JhdHRlcnknLCB2YWx1ZTogJzdoICsgMjFoIENhc2UnIH0sXG4gICAgICB7IGtleTogJ1dhcnJhbnR5JywgdmFsdWU6ICc2IE1vbnRocyBXYXJyYW50eScgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydHcmFwaGl0ZSBCbGFjaycsICdQZWFybCBXaGl0ZSddLFxuICAgIHRhZ3M6IFsndHdzJywgJ2VhcmJ1ZHMnLCAnYmx1ZXRvb3RoJywgJ2F1ZGlvJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ1RXUyBFYXJidWRzIFBybycsICdIZWFkcGhvbmVzJywgJ0VOQyBNaWMnKSwgTE9DQUxfUEhPVE9TLmF1ZGlvR2FtaW5nXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ0Nhc2ggb24gRGVsaXZlcnkgYWNyb3NzIEJhbmdsYWRlc2guJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXBsYWNlbWVudC4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiB0cnVlLFxuICAgIGlzVHJlbmRpbmc6IHRydWUsXG4gICAgaXNOZXdBcnJpdmFsOiB0cnVlXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Byb2Qtc21hcnQtZml0bmVzcy13YXRjaCcsXG4gICAgbmFtZTogJ1NtYXJ0IEZpdG5lc3MgV2F0Y2gnLFxuICAgIHNsdWc6ICdzbWFydC1maXRuZXNzLXdhdGNoJyxcbiAgICBicmFuZDogJ0FtYXpGaXQgU3R5bGUnLFxuICAgIGNhdGVnb3J5OiAnU21hcnQgV2F0Y2hlcycsXG4gICAgcHJpY2U6IDI5OTAsXG4gICAgb2xkUHJpY2U6IDM5OTAsXG4gICAgc3RvY2s6IDM0LFxuICAgIHVuaXRzU29sZDogOTIsXG4gICAgc2t1OiAnUFotU1ctNDAxJyxcbiAgICByYXRpbmc6IDQuNyxcbiAgICByZXZpZXdDb3VudDogMTA5LFxuICAgIHNob3J0RGVzY3JpcHRpb246ICcxLjQzXCIgQU1PTEVEIGFsd2F5cy1vbiBkaXNwbGF5LCBCbHVldG9vdGggY2FsbGluZywgU3BPMiwgaGVhcnQgcmF0ZSAmIDEwLWRheSBiYXR0ZXJ5LicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnU3RheSBjb25uZWN0ZWQgd2l0aG91dCBwdWxsaW5nIG91dCB5b3VyIHBob25lLiBGZWF0dXJlcyBtZXRhbGxpYyBiZXplbCwgMTAwKyBzcG9ydHMgbW9kZXMsIEJhbmdsYSBub3RpZmljYXRpb24gZm9udCBzdXBwb3J0LCBhbmQgSVA2OCB3YXRlciByZXNpc3RhbmNlLicsXG4gICAgZmVhdHVyZXM6IFsnMS40M1wiIEJyaWdodCBBTU9MRUQgRGlzcGxheScsICdCbHVldG9vdGggVm9pY2UgQ2FsbGluZycsICcyNC83IEhlYXJ0IFJhdGUsIFNsZWVwICYgU3BPMicsICcxMCBEYXlzIEJhdHRlcnkgRW5kdXJhbmNlJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnRGlzcGxheScsIHZhbHVlOiAnMS40M1wiIFJvdW5kIEFNT0xFRCcgfSxcbiAgICAgIHsga2V5OiAnV2F0ZXIgUmVzaXN0YW5jZScsIHZhbHVlOiAnSVA2OCcgfSxcbiAgICAgIHsga2V5OiAnQmF0dGVyeScsIHZhbHVlOiAnVXAgdG8gMTAgRGF5cycgfSxcbiAgICAgIHsga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzYgTW9udGhzIE9mZmljaWFsIFdhcnJhbnR5JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ09ic2lkaWFuIEJsYWNrJywgJ1RlYWwgU3RyYXAnXSxcbiAgICB0YWdzOiBbJ3NtYXJ0d2F0Y2gnLCAnZml0bmVzcycsICdhbW9sZWQnLCAnY2FsbGluZyB3YXRjaCddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5oZXJvVGVjaCwgbWFrZVByb2R1Y3RTdmcoJ1NtYXJ0IEZpdG5lc3MgV2F0Y2gnLCAnU21hcnQgV2F0Y2hlcycsICdBTU9MRUQnKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdOYXRpb253aWRlIENPRCBkZWxpdmVyeS4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IGVhc3kgcmV0dXJuLicsXG4gICAgaXNGZWF0dXJlZDogdHJ1ZSxcbiAgICBpc0ZsYXNoU2FsZTogdHJ1ZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC13aXJlbGVzcy1nYW1lcGFkJyxcbiAgICBuYW1lOiAnV2lyZWxlc3MgR2FtZXBhZCBDb250cm9sbGVyJyxcbiAgICBzbHVnOiAnd2lyZWxlc3MtZ2FtZXBhZC1jb250cm9sbGVyJyxcbiAgICBicmFuZDogJ1JlZHJhZ29uJyxcbiAgICBjYXRlZ29yeTogJ0dhbWluZycsXG4gICAgcHJpY2U6IDI0NTAsXG4gICAgb2xkUHJpY2U6IDMyMDAsXG4gICAgc3RvY2s6IDI1LFxuICAgIHVuaXRzU29sZDogNDYsXG4gICAgc2t1OiAnUFotR00tNTAxJyxcbiAgICByYXRpbmc6IDQuOCxcbiAgICByZXZpZXdDb3VudDogNjQsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ0R1YWwtdmlicmF0aW9uIEhhbGwtZWZmZWN0IHRyaWdnZXJzIGZvciBQQywgQW5kcm9pZCwgYW5kIENvbnNvbGUgZ2FtaW5nLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnUmVzcG9uc2l2ZSB0cmlnZ2VycywgZXJnb25vbWljIGFudGktc2xpcCBncmlwcywgMi40R0h6IGRvbmdsZSArIEJsdWV0b290aCBjb25uZWN0aXZpdHksIGFuZCAxNS1ob3VyIHJlY2hhcmdlYWJsZSBiYXR0ZXJ5IGZvciBtYXJhdGhvbiBnYW1pbmcgc2Vzc2lvbnMuJyxcbiAgICBmZWF0dXJlczogWycyLjRHSHogV2lyZWxlc3MgKyBCbHVldG9vdGggKyBVU0ItQycsICdIYWxsLUVmZmVjdCBaZXJvLURyaWZ0IFRyaWdnZXJzJywgJ0R1YWwgQXN5bW1ldHJpYyBWaWJyYXRpb24gTW90b3JzJywgJzE1aCBSZWNoYXJnZWFibGUgQmF0dGVyeSddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ0NvbXBhdGliaWxpdHknLCB2YWx1ZTogJ1dpbmRvd3MgUEMsIEFuZHJvaWQsIFN3aXRjaCcgfSxcbiAgICAgIHsga2V5OiAnQmF0dGVyeScsIHZhbHVlOiAnNjAwbUFoIExpLWlvbicgfSxcbiAgICAgIHsga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzYgTW9udGhzIFdhcnJhbnR5JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ1N0ZWFsdGggQmxhY2snLCAnQ29yYWwgUmVkJ10sXG4gICAgdGFnczogWydnYW1lcGFkJywgJ2NvbnRyb2xsZXInLCAnZ2FtaW5nJywgJ3BjIGdhbWluZyddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5hdWRpb0dhbWluZywgbWFrZVByb2R1Y3RTdmcoJ1dpcmVsZXNzIEdhbWVwYWQnLCAnR2FtaW5nJywgJ1BDL0FuZHJvaWQnKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICcyNC00OGggSW5zaWRlIERoYWthLicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgcmVwbGFjZW1lbnQuJyxcbiAgICBpc0ZlYXR1cmVkOiBmYWxzZSxcbiAgICBpc0ZsYXNoU2FsZTogZmFsc2UsXG4gICAgaXNUcmVuZGluZzogdHJ1ZSxcbiAgICBpc05ld0Fycml2YWw6IHRydWVcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1yZ2ItZ2FtaW5nLW1vdXNlJyxcbiAgICBuYW1lOiAnUkdCIEdhbWluZyBNb3VzZScsXG4gICAgc2x1ZzogJ3JnYi1nYW1pbmctbW91c2UnLFxuICAgIGJyYW5kOiAnRmFudGVjaCcsXG4gICAgY2F0ZWdvcnk6ICdHYW1pbmcnLFxuICAgIHByaWNlOiA4OTAsXG4gICAgb2xkUHJpY2U6IDEyOTAsXG4gICAgc3RvY2s6IDU0LFxuICAgIHVuaXRzU29sZDogMTEyLFxuICAgIHNrdTogJ1BaLUdNLTUwMicsXG4gICAgcmF0aW5nOiA0LjUsXG4gICAgcmV2aWV3Q291bnQ6IDg5LFxuICAgIHNob3J0RGVzY3JpcHRpb246ICc3MjAwIERQSSBvcHRpY2FsIHNlbnNvciwgbGlnaHR3ZWlnaHQgNjlnIHNoZWxsICYgMjBNIGNsaWNrIEh1YW5vIHN3aXRjaGVzLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnUGlucG9pbnQgYWNjdXJhY3kgZm9yIFZhbG9yYW50LCBDUzIsIGFuZCBldmVyeWRheSB3b3JrIHdpdGggY3VzdG9taXphYmxlIERQSSBzdGVwcyBhbmQgYnJhaWRlZCBwYXJhY29yZCBjYWJsZS4nLFxuICAgIGZlYXR1cmVzOiBbJzcyMDAgQWRqdXN0YWJsZSBEUEkgU2Vuc29yJywgJ1VsdHJhLUxpZ2h0IDY5ZyBFcmdvbm9taWMgQm9keScsICc3IFByb2dyYW1tYWJsZSBCdXR0b25zJywgJ0R5bmFtaWMgUkdCIExpZ2h0aW5nJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnRFBJJywgdmFsdWU6ICc4MDAgLSA3MjAwIERQSScgfSxcbiAgICAgIHsga2V5OiAnU3dpdGNoZXMnLCB2YWx1ZTogJzIwIE1pbGxpb24gQ2xpY2tzJyB9LFxuICAgICAgeyBrZXk6ICdXZWlnaHQnLCB2YWx1ZTogJzY5ZycgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydCbGFjaycsICdXaGl0ZSddLFxuICAgIHRhZ3M6IFsnbW91c2UnLCAnZ2FtaW5nIG1vdXNlJywgJ3JnYicsICdlc3BvcnRzJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ1JHQiBHYW1pbmcgTW91c2UnLCAnR2FtaW5nJywgJzcyMDAgRFBJJyksIExPQ0FMX1BIT1RPUy5hdWRpb0dhbWluZ10sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdJbnNpZGUgRGhha2Eg4KezNjAuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXBsYWNlbWVudC4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiB0cnVlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1wb3dlci1iYW5rLTIwaycsXG4gICAgbmFtZTogJzIwMDAwbUFoIFBvd2VyIEJhbmsnLFxuICAgIHNsdWc6ICcyMDAwMG1haC1wb3dlci1iYW5rJyxcbiAgICBicmFuZDogJ0Jhc2V1cycsXG4gICAgY2F0ZWdvcnk6ICdBY2Nlc3NvcmllcycsXG4gICAgcHJpY2U6IDE2NTAsXG4gICAgb2xkUHJpY2U6IDIxMDAsXG4gICAgc3RvY2s6IDc1LFxuICAgIHVuaXRzU29sZDogMTU4LFxuICAgIHNrdTogJ1BaLUFDLTYwMScsXG4gICAgcmF0aW5nOiA0LjcsXG4gICAgcmV2aWV3Q291bnQ6IDIwNCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMjIuNVcgUEQgZmFzdCBjaGFyZ2luZywgTEVEIHBlcmNlbnRhZ2UgZGlzcGxheSAmIGR1YWwgVVNCLUEgKyBVU0ItQyBwb3J0cy4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ0Vzc2VudGlhbCB0cmF2ZWwgYW5kIGxvYWQtc2hlZGRpbmcgY29tcGFuaW9uLiBTYWZlbHkgZmFzdC1jaGFyZ2VzIHBob25lcyA0IHRpbWVzIHdpdGggbXVsdGktbGF5ZXIgc3VyZ2UgcHJvdGVjdGlvbi4nLFxuICAgIGZlYXR1cmVzOiBbJ1RydWUgMjAwMDBtQWggSGlnaC1EZW5zaXR5IENlbGwnLCAnMjIuNVcgUEQgKyBRQyAzLjAgRmFzdCBDaGFyZ2UnLCAnTEVEIERpZ2l0YWwgQmF0dGVyeSBEaXNwbGF5JywgJ0FpcmxpbmUtU2FmZSBDZXJ0aWZpZWQnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdDYXBhY2l0eScsIHZhbHVlOiAnMjAwMDBtQWggLyA3NFdoJyB9LFxuICAgICAgeyBrZXk6ICdPdXRwdXQnLCB2YWx1ZTogJ01heCAyMi41VycgfSxcbiAgICAgIHsga2V5OiAnUG9ydHMnLCB2YWx1ZTogJzF4IFVTQi1DLCAyeCBVU0ItQScgfSxcbiAgICAgIHsga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzYgTW9udGhzIFdhcnJhbnR5JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ01hdHRlIEJsYWNrJywgJ1doaXRlJ10sXG4gICAgdGFnczogWydwb3dlciBiYW5rJywgJzIwMDAwbWFoJywgJ2Jhc2V1cycsICdmYXN0IGNoYXJnZSddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5zbWFydERldmljZXMsIG1ha2VQcm9kdWN0U3ZnKCcyMDAwMG1BaCBQb3dlciBCYW5rJywgJ0FjY2Vzc29yaWVzJywgJzIyLjVXIFBEJyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnRmFzdCBkZWxpdmVyeSBuYXRpb253aWRlLicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgcmVwbGFjZW1lbnQuJyxcbiAgICBpc0ZlYXR1cmVkOiB0cnVlLFxuICAgIGlzRmxhc2hTYWxlOiBmYWxzZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC02NXctZ2FuLWNoYXJnZXInLFxuICAgIG5hbWU6ICc2NVcgRmFzdCBDaGFyZ2VyJyxcbiAgICBzbHVnOiAnNjV3LWZhc3QtY2hhcmdlcicsXG4gICAgYnJhbmQ6ICdBbmtlciBHYU4nLFxuICAgIGNhdGVnb3J5OiAnQWNjZXNzb3JpZXMnLFxuICAgIHByaWNlOiAxMTkwLFxuICAgIG9sZFByaWNlOiAxNTkwLFxuICAgIHN0b2NrOiA2MCxcbiAgICB1bml0c1NvbGQ6IDk1LFxuICAgIHNrdTogJ1BaLUFDLTYwMicsXG4gICAgcmF0aW5nOiA0LjgsXG4gICAgcmV2aWV3Q291bnQ6IDc3LFxuICAgIHNob3J0RGVzY3JpcHRpb246ICdDb21wYWN0IDMtcG9ydCBHYU4gY2hhcmdlciBmb3IgbGFwdG9wcywgdGFibGV0cywgYW5kIHNtYXJ0cGhvbmVzLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnUG93ZXIgeW91ciBNYWNCb29rL0lkZWFQYWQgYW5kIHR3byBwaG9uZXMgc2ltdWx0YW5lb3VzbHkgZnJvbSBhIHNpbmdsZSBjb21wYWN0IFVLL0JEIDMtcGluIGNvbXBhdGlibGUgYWRhcHRlci4nLFxuICAgIGZlYXR1cmVzOiBbJzY1VyBHYU4gSGlnaC1FZmZpY2llbmN5IFRlY2gnLCAnMnggVVNCLUMgKyAxeCBVU0ItQSBQb3J0cycsICdDb29sLVRlbXAgQWN0aXZlU2hpZWxkIFNhZmV0eScsICdDb21wYWN0IFRyYXZlbCBTaXplJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnT3V0cHV0JywgdmFsdWU6ICc2NVcgTWF4IFBvd2VyIERlbGl2ZXJ5JyB9LFxuICAgICAgeyBrZXk6ICdQb3J0cycsIHZhbHVlOiAnMnggVHlwZS1DLCAxeCBVU0ItQScgfSxcbiAgICAgIHsga2V5OiAnV2FycmFudHknLCB2YWx1ZTogJzYgTW9udGhzIFJlcGxhY2VtZW50JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ0NoYXJjb2FsJ10sXG4gICAgdGFnczogWydjaGFyZ2VyJywgJzY1dycsICdnYW4nLCAndXNiLWMnLCAnbGFwdG9wIGNoYXJnZXInXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnNjVXIEZhc3QgQ2hhcmdlcicsICdBY2Nlc3NvcmllcycsICdHYU4gMy1Qb3J0JyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnSW5zaWRlIERoYWthIDI0aC4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IHJlcGxhY2VtZW50LicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLWJsdWV0b290aC1zcGVha2VyJyxcbiAgICBuYW1lOiAnUG9ydGFibGUgQmx1ZXRvb3RoIFNwZWFrZXInLFxuICAgIHNsdWc6ICdwb3J0YWJsZS1ibHVldG9vdGgtc3BlYWtlcicsXG4gICAgYnJhbmQ6ICdKQkwgQ2xpcCBTdHlsZScsXG4gICAgY2F0ZWdvcnk6ICdIZWFkcGhvbmVzJyxcbiAgICBwcmljZTogMTg5MCxcbiAgICBvbGRQcmljZTogMjQ5MCxcbiAgICBzdG9jazogMzgsXG4gICAgdW5pdHNTb2xkOiA2NyxcbiAgICBza3U6ICdQWi1BVS0zMDMnLFxuICAgIHJhdGluZzogNC42LFxuICAgIHJldmlld0NvdW50OiA3MixcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMzYwwrAgcmljaCBiYXNzIGF1ZGlvLCBJUFg3IHdhdGVycHJvb2YgYm9keSAmIDEyLWhvdXIgb3V0ZG9vciBiYXR0ZXJ5LicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnQnVpbHQgZm9yIHJvb2Z0b3BzLCBDb3jigJlzIEJhemFyIHRyaXBzLCBhbmQgZGVzayBsaXN0ZW5pbmcgd2l0aCBzdGVyZW8gVFdTIHBhaXJpbmcgYW5kIGJ1aWx0LWluIG1pY3JvcGhvbmUuJyxcbiAgICBmZWF0dXJlczogWycxMiBIb3VycyBDb250aW51b3VzIFBsYXl0aW1lJywgJ0lQWDcgV2F0ZXJwcm9vZiAmIER1c3Rwcm9vZicsICdUV1MgRHVhbCBTcGVha2VyIFBhaXJpbmcnLCAnVVNCLUMgQ2hhcmdpbmcnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdPdXRwdXQnLCB2YWx1ZTogJzE1VyBSTVMnIH0sXG4gICAgICB7IGtleTogJ0JhdHRlcnknLCB2YWx1ZTogJzEyIEhvdXJzJyB9LFxuICAgICAgeyBrZXk6ICdXYXRlcnByb29mJywgdmFsdWU6ICdJUFg3JyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ0RlZXAgVGVhbCcsICdDaGFyY29hbCddLFxuICAgIHRhZ3M6IFsnc3BlYWtlcicsICdibHVldG9vdGgnLCAncG9ydGFibGUnLCAnYXVkaW8nXSxcbiAgICBpbWFnZXM6IFtMT0NBTF9QSE9UT1MuaGVyb1dvcmtzcGFjZSwgbWFrZVByb2R1Y3RTdmcoJ0JsdWV0b290aCBTcGVha2VyJywgJ0hlYWRwaG9uZXMnLCAnSVBYNycpXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ05hdGlvbndpZGUgQ09ELicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgcmV0dXJuLicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IHRydWUsXG4gICAgaXNOZXdBcnJpdmFsOiBmYWxzZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLXdpZmktc2VjdXJpdHktY2FtZXJhJyxcbiAgICBuYW1lOiAnV2ktRmkgU21hcnQgU2VjdXJpdHkgQ2FtZXJhJyxcbiAgICBzbHVnOiAnd2lmaS1zbWFydC1zZWN1cml0eS1jYW1lcmEnLFxuICAgIGJyYW5kOiAnSU1PVScsXG4gICAgY2F0ZWdvcnk6ICdTbWFydCBIb21lJyxcbiAgICBwcmljZTogMjM1MCxcbiAgICBvbGRQcmljZTogMjk5MCxcbiAgICBzdG9jazogMzEsXG4gICAgdW5pdHNTb2xkOiA1OCxcbiAgICBza3U6ICdQWi1TSC03MDEnLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiA5MSxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMksgM01QIDM2MMKwIHBhbi10aWx0IGluZG9vciBjYW1lcmEgd2l0aCBBSSBodW1hbiBkZXRlY3Rpb24gJiBuaWdodCB2aXNpb24uJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdLZWVwIGFuIGV5ZSBvbiB5b3VyIGhvbWUsIHNob3AsIG9yIG9mZmljZSBmcm9tIGFueXdoZXJlIHZpYSBzbWFydHBob25lIGFwcCB3aXRoIHR3by13YXkgdGFsayBhbmQgbWljcm9TRCByZWNvcmRpbmcuJyxcbiAgICBmZWF0dXJlczogWycySyAzTVAgQ3J5c3RhbCBDbGVhciBWaWRlbycsICczNjDCsCBQYW4gJiBUaWx0IFRyYWNraW5nJywgJ0luZnJhcmVkIE5pZ2h0IFZpc2lvbiB1cCB0byAxMG0nLCAnVHdvLVdheSBBdWRpbyAmIFNpcmVuIEFsZXJ0J10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnUmVzb2x1dGlvbicsIHZhbHVlOiAnMjMwNCB4IDEyOTYgKDNNUCknIH0sXG4gICAgICB7IGtleTogJ1N0b3JhZ2UnLCB2YWx1ZTogJ01pY3JvU0QgdXAgdG8gMjU2R0InIH0sXG4gICAgICB7IGtleTogJ1dhcnJhbnR5JywgdmFsdWU6ICcxIFllYXIgV2FycmFudHknIH1cbiAgICBdLFxuICAgIG9wdGlvbnM6IFsnUHVyZSBXaGl0ZSddLFxuICAgIHRhZ3M6IFsnY2N0dicsICdzbWFydCBjYW1lcmEnLCAnd2lmaSBjYW1lcmEnLCAnc21hcnQgaG9tZSddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5zbWFydERldmljZXMsIG1ha2VQcm9kdWN0U3ZnKCdXaS1GaSBTZWN1cml0eSBDYW1lcmEnLCAnU21hcnQgSG9tZScsICcySyAzNjDCsCcpXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ0ZyZWUgc2V0dXAgZ3VpZGUgaW5jbHVkZWQuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXBsYWNlbWVudC4nLFxuICAgIGlzRmVhdHVyZWQ6IHRydWUsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLXNtYXJ0LWxlZC1idWxiJyxcbiAgICBuYW1lOiAnU21hcnQgTEVEIEJ1bGInLFxuICAgIHNsdWc6ICdzbWFydC1sZWQtYnVsYicsXG4gICAgYnJhbmQ6ICdZZWVsaWdodCcsXG4gICAgY2F0ZWdvcnk6ICdTbWFydCBIb21lJyxcbiAgICBwcmljZTogNjUwLFxuICAgIG9sZFByaWNlOiA4OTAsXG4gICAgc3RvY2s6IDgwLFxuICAgIHVuaXRzU29sZDogMTQwLFxuICAgIHNrdTogJ1BaLVNILTcwMicsXG4gICAgcmF0aW5nOiA0LjUsXG4gICAgcmV2aWV3Q291bnQ6IDY2LFxuICAgIHNob3J0RGVzY3JpcHRpb246ICcxNiBtaWxsaW9uIFJHQiBjb2xvcnMgKyB0dW5hYmxlIHdhcm0vY29vbCB3aGl0ZSwgdm9pY2UgY29udHJvbCAmIHNjaGVkdWxlIHRpbWVyLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnVHJhbnNmb3JtIGFueSByb29tIGFtYmlhbmNlIGZyb20gY296eSB3YXJtIHJlYWRpbmcgbGlnaHQgdG8gdmlicmFudCBnYW1pbmcgY29sb3JzIHZpYSBXaS1GaSBhcHAgd2l0aCBubyBodWIgcmVxdWlyZWQuJyxcbiAgICBmZWF0dXJlczogWyc5VyBFbmVyZ3ktU2F2aW5nIDg1MCBMdW1lbnMnLCAnMTZNIFJHQiArIFdhcm0vQ29vbCBXaGl0ZScsICdBbGV4YSAmIEdvb2dsZSBIb21lIENvbXBhdGlibGUnLCAnQjIyIC8gRTI3IEZpdHRpbmcnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdQb3dlcicsIHZhbHVlOiAnOVcgKDg1MGxtKScgfSxcbiAgICAgIHsga2V5OiAnQ29ubmVjdGl2aXR5JywgdmFsdWU6ICdXaS1GaSAyLjRHSHonIH0sXG4gICAgICB7IGtleTogJ0xpZmVzcGFuJywgdmFsdWU6ICcyNSwwMDAgSG91cnMnIH1cbiAgICBdLFxuICAgIG9wdGlvbnM6IFsnRTI3IFNjcmV3JywgJ0IyMiBQaW4nXSxcbiAgICB0YWdzOiBbJ3NtYXJ0IGJ1bGInLCAnbGVkJywgJ3JnYicsICdzbWFydCBob21lJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ1NtYXJ0IExFRCBCdWxiJywgJ1NtYXJ0IEhvbWUnLCAnMTZNIFJHQicpLCBMT0NBTF9QSE9UT1Muc21hcnREZXZpY2VzXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ0luc2lkZSBEaGFrYSDgp7M2MC4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IHJlcGxhY2VtZW50LicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IHRydWUsXG4gICAgaXNUcmVuZGluZzogZmFsc2UsXG4gICAgaXNOZXdBcnJpdmFsOiBmYWxzZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLWNvdHRvbi1wYW5qYWJpJyxcbiAgICBuYW1lOiAnUHJlbWl1bSBDb3R0b24gUGFuamFiaScsXG4gICAgc2x1ZzogJ3ByZW1pdW0tY290dG9uLXBhbmphYmknLFxuICAgIGJyYW5kOiAnQWFyb25nIENyYWZ0IExpbmUnLFxuICAgIGNhdGVnb3J5OiAnRmFzaGlvbicsXG4gICAgcHJpY2U6IDE0NTAsXG4gICAgb2xkUHJpY2U6IDE5NTAsXG4gICAgc3RvY2s6IDQ1LFxuICAgIHVuaXRzU29sZDogMTAzLFxuICAgIHNrdTogJ1BaLUZBLTgwMScsXG4gICAgcmF0aW5nOiA0LjgsXG4gICAgcmV2aWV3Q291bnQ6IDExOCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMTAwJSBicmVhdGhhYmxlIGNvbWJlZCBjb3R0b24gUGFuamFiaSB3aXRoIHN1YnRsZSBjb2xsYXIgZW1icm9pZGVyeSBmb3IgZXZlcnlkYXkgJiBmZXN0aXZlIHdlYXIuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdUYWlsb3JlZCBpbiBCYW5nbGFkZXNoIGZyb20gc29mdCAxMDAlIGxvbmctc3RhcGxlIGNvdHRvbiBzdWl0ZWQgZm9yIHRyb3BpY2FsIHdlYXRoZXIuIENyaXNwIHN0YW5kIGNvbGxhciwgc2lkZSBwb2NrZXRzLCBhbmQgemVyby1zaHJpbmthZ2UgcHJlLXdhc2hlZCBmaW5pc2guJyxcbiAgICBmZWF0dXJlczogWycxMDAlIFB1cmUgQ29tYmVkIENvdHRvbicsICdIYW5kLUZpbmlzaGVkIE1pbmltYWwgRW1icm9pZGVyeScsICdCcmVhdGhhYmxlIEFsbC1TZWFzb24gV2VhdmUnLCAnUHJlLVdhc2hlZCBDb2xvcmZhc3QgRmFicmljJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnTWF0ZXJpYWwnLCB2YWx1ZTogJzEwMCUgQ290dG9uJyB9LFxuICAgICAgeyBrZXk6ICdGaXQnLCB2YWx1ZTogJ1JlZ3VsYXIgQ29tZm9ydCBGaXQnIH0sXG4gICAgICB7IGtleTogJ0NhcmUnLCB2YWx1ZTogJ0dlbnRsZSBNYWNoaW5lIG9yIEhhbmQgV2FzaCcgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydNICg0MCknLCAnTCAoNDIpJywgJ1hMICg0NCknLCAnWFhMICg0NiknXSxcbiAgICB0YWdzOiBbJ3BhbmphYmknLCAnZmFzaGlvbicsICdjb3R0b24nLCAnZWlkJywgJ21lbnN3ZWFyJ10sXG4gICAgaW1hZ2VzOiBbTE9DQUxfUEhPVE9TLmxpZmVzdHlsZUZhc2hpb24sIG1ha2VQcm9kdWN0U3ZnKCdQcmVtaXVtIENvdHRvbiBQYW5qYWJpJywgJ0Zhc2hpb24nLCAnMTAwJSBDb3R0b24nKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdGYXN0IERoYWthICYgbmF0aW9ud2lkZSBkZWxpdmVyeS4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IHNpemUgZXhjaGFuZ2UgYXZhaWxhYmxlLicsXG4gICAgaXNGZWF0dXJlZDogdHJ1ZSxcbiAgICBpc0ZsYXNoU2FsZTogZmFsc2UsXG4gICAgaXNUcmVuZGluZzogdHJ1ZSxcbiAgICBpc05ld0Fycml2YWw6IHRydWVcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1jYXN1YWwtc25lYWtlcnMnLFxuICAgIG5hbWU6ICdDYXN1YWwgU25lYWtlcnMnLFxuICAgIHNsdWc6ICdjYXN1YWwtc25lYWtlcnMnLFxuICAgIGJyYW5kOiAnU3RlcEJEJyxcbiAgICBjYXRlZ29yeTogJ0Zhc2hpb24nLFxuICAgIHByaWNlOiAyMjkwLFxuICAgIG9sZFByaWNlOiAyOTkwLFxuICAgIHN0b2NrOiAzMCxcbiAgICB1bml0c1NvbGQ6IDYyLFxuICAgIHNrdTogJ1BaLUZBLTgwMicsXG4gICAgcmF0aW5nOiA0LjYsXG4gICAgcmV2aWV3Q291bnQ6IDc0LFxuICAgIHNob3J0RGVzY3JpcHRpb246ICdNaW5pbWFsaXN0IG9mZi13aGl0ZSBjdXNoaW9uZWQgc25lYWtlcnMgd2l0aCBicmVhdGhhYmxlIGxpbmluZyAmIGFudGktc2xpcCBzb2xlLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnVmVyc2F0aWxlIGV2ZXJ5ZGF5IHNuZWFrZXJzIGRlc2lnbmVkIHRvIHBhaXIgZWZmb3J0bGVzc2x5IHdpdGggamVhbnMsIGNoaW5vcywgb3IgUGFuamFiaS4gSGlnaC1yZWJvdW5kIGluc29sZSByZWR1Y2VzIHdhbGtpbmcgZmF0aWd1ZS4nLFxuICAgIGZlYXR1cmVzOiBbJ1NvZnQgTWVtb3J5IEZvYW0gSW5zb2xlJywgJ0FudGktU2tpZCBSdWJiZXIgT3V0c29sZScsICdFYXN5LUNsZWFuIFZlZ2FuIExlYXRoZXIgVXBwZXInXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdVcHBlcicsIHZhbHVlOiAnTWljcm9maWJlciBWZWdhbiBMZWF0aGVyJyB9LFxuICAgICAgeyBrZXk6ICdTb2xlJywgdmFsdWU6ICdIaWdoLUdyaXAgVFBSJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ0VVIDQwJywgJ0VVIDQxJywgJ0VVIDQyJywgJ0VVIDQzJywgJ0VVIDQ0J10sXG4gICAgdGFnczogWydzbmVha2VycycsICdzaG9lcycsICdmYXNoaW9uJywgJ2Zvb3R3ZWFyJ10sXG4gICAgaW1hZ2VzOiBbTE9DQUxfUEhPVE9TLmxpZmVzdHlsZUZhc2hpb24sIG1ha2VQcm9kdWN0U3ZnKCdDYXN1YWwgU25lYWtlcnMnLCAnRmFzaGlvbicsICdNZW1vcnkgRm9hbScpXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ05hdGlvbndpZGUgQ09ELicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgc2l6ZSBleGNoYW5nZS4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiBmYWxzZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1oeWRyYXRpbmctZmFjZS1zZXJ1bScsXG4gICAgbmFtZTogJ0h5ZHJhdGluZyBGYWNlIFNlcnVtJyxcbiAgICBzbHVnOiAnaHlkcmF0aW5nLWZhY2Utc2VydW0nLFxuICAgIGJyYW5kOiAnQm90YW5pY2EgQ2FyZScsXG4gICAgY2F0ZWdvcnk6ICdCZWF1dHkgJiBTa2luY2FyZScsXG4gICAgcHJpY2U6IDk5MCxcbiAgICBvbGRQcmljZTogMTM1MCxcbiAgICBzdG9jazogNTIsXG4gICAgdW5pdHNTb2xkOiA4OCxcbiAgICBza3U6ICdQWi1TSy05MDEnLFxuICAgIHJhdGluZzogNC43LFxuICAgIHJldmlld0NvdW50OiA5MyxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMiUgSHlhbHVyb25pYyBBY2lkICsgTmlhY2luYW1pZGUgbGlnaHR3ZWlnaHQgbm9uLXN0aWNreSBnbG93IHNlcnVtICgzMG1sKS4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ0Zvcm11bGF0ZWQgZm9yIGh1bWlkIFNvdXRoIEFzaWFuIHdlYXRoZXIuIERlZXBseSBoeWRyYXRlcyB3aXRob3V0IGNsb2dnaW5nIHBvcmVzLCBiYWxhbmNlcyBvaWwsIGFuZCBicmlnaHRlbnMgc2tpbiB0b25lLicsXG4gICAgZmVhdHVyZXM6IFsnMiUgTXVsdGktTW9sZWN1bGFyIEh5YWx1cm9uaWMgQWNpZCcsICc1JSBOaWFjaW5hbWlkZScsICdGcmFncmFuY2UtRnJlZSAmIFBhcmFiZW4tRnJlZScsICdEZXJtYXRvbG9naWNhbGx5IFRlc3RlZCddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ1ZvbHVtZScsIHZhbHVlOiAnMzBtbCBBbWJlciBEcm9wcGVyJyB9LFxuICAgICAgeyBrZXk6ICdTa2luIFR5cGUnLCB2YWx1ZTogJ0FsbCBTa2luIFR5cGVzJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJzMwbWwgQm90dGxlJ10sXG4gICAgdGFnczogWydzZXJ1bScsICdza2luY2FyZScsICdiZWF1dHknLCAnaHlhbHVyb25pYycsICd3b21lbiddLFxuICAgIGltYWdlczogW21ha2VQcm9kdWN0U3ZnKCdIeWRyYXRpbmcgRmFjZSBTZXJ1bScsICdCZWF1dHkgJiBTa2luY2FyZScsICczMG1sIEdsb3cnKSwgTE9DQUxfUEhPVE9TLmxpZmVzdHlsZUZhc2hpb25dLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnU2VhbGVkIGF1dGhlbnRpYyBwYWNrYWdpbmcuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXR1cm4gaWYgc2VhbCBpbnRhY3QuJyxcbiAgICBpc0ZlYXR1cmVkOiBmYWxzZSxcbiAgICBpc0ZsYXNoU2FsZTogdHJ1ZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLXZpdGFtaW4tYy1nbG93LXNlcnVtJyxcbiAgICBuYW1lOiAnVml0YW1pbiBDIDE1JSBCcmlnaHRlbmluZyBTZXJ1bScsXG4gICAgc2x1ZzogJ3ZpdGFtaW4tYy0xNS1icmlnaHRlbmluZy1zZXJ1bScsXG4gICAgYnJhbmQ6ICdCb3RhbmljYSBDYXJlJyxcbiAgICBjYXRlZ29yeTogJ0JlYXV0eSAmIFNraW5jYXJlJyxcbiAgICBwcmljZTogMTE1MCxcbiAgICBvbGRQcmljZTogMTQ5MCxcbiAgICBzdG9jazogNDQsXG4gICAgdW5pdHNTb2xkOiA3NixcbiAgICBza3U6ICdQWi1TSy05MDInLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiA2OCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMTUlIEV0aHlsIEFzY29yYmljIEFjaWQgKyBGZXJ1bGljIGdsb3cgc2VydW0gdG8gZmFkZSBkYXJrIHNwb3RzIGFuZCBkdWxsbmVzcy4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ0xpZ2h0d2VpZ2h0IG1vcm5pbmcgVml0YW1pbiBDIHNlcnVtIHRhaWxvcmVkIGZvciB3b21lbiBpbiBCYW5nbGFkZXNoLiBIZWxwcyBmYWRlIHBvc3QtYWNuZSBtYXJrcywgYm9vc3RzIG5hdHVyYWwgcmFkaWFuY2UsIGFuZCBhYnNvcmJzIGNsZWFubHkgd2l0aG91dCBncmVhc2luZXNzLicsXG4gICAgZmVhdHVyZXM6IFsnMTUlIFN0YWJsZSBWaXRhbWluIEMnLCAnRmVydWxpYyBBY2lkICsgVml0YW1pbiBFJywgJ0JyaWdodGVucyBVbmV2ZW4gU2tpbiBUb25lJywgJ05vbi1Db21lZG9nZW5pYyAmIEFsY29ob2wtRnJlZSddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ1ZvbHVtZScsIHZhbHVlOiAnMzBtbCBVVi1Qcm90ZWN0ZWQgRHJvcHBlcicgfSxcbiAgICAgIHsga2V5OiAnQmVzdCBGb3InLCB2YWx1ZTogJ0R1bGwgU2tpbiAmIERhcmsgU3BvdHMnIH1cbiAgICBdLFxuICAgIG9wdGlvbnM6IFsnMzBtbCBEcm9wcGVyJ10sXG4gICAgdGFnczogWyd2aXRhbWluIGMnLCAnc2VydW0nLCAnYnJpZ2h0ZW5pbmcnLCAnc2tpbmNhcmUnLCAnd29tZW4nXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnVml0YW1pbiBDIDE1JSBTZXJ1bScsICdCZWF1dHkgJiBTa2luY2FyZScsICdCcmlnaHRlbmluZycpLCBMT0NBTF9QSE9UT1MubGlmZXN0eWxlRmFzaGlvbl0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdJbnNpZGUgRGhha2EgMjQtNDhoLiBOYXRpb253aWRlIENPRC4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IHJlcGxhY2VtZW50IGlmIHNlYWwgaW50YWN0LicsXG4gICAgaXNGZWF0dXJlZDogdHJ1ZSxcbiAgICBpc0ZsYXNoU2FsZTogdHJ1ZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLW5pYWNpbmFtaWRlLTEwLXppbmMtc2VydW0nLFxuICAgIG5hbWU6ICdOaWFjaW5hbWlkZSAxMCUgKyBaaW5jIFBvcmUgU2VydW0nLFxuICAgIHNsdWc6ICduaWFjaW5hbWlkZS0xMC16aW5jLXBvcmUtc2VydW0nLFxuICAgIGJyYW5kOiAnRGVybWFQdXJlIEJEJyxcbiAgICBjYXRlZ29yeTogJ0JlYXV0eSAmIFNraW5jYXJlJyxcbiAgICBwcmljZTogODkwLFxuICAgIG9sZFByaWNlOiAxMTUwLFxuICAgIHN0b2NrOiA2MCxcbiAgICB1bml0c1NvbGQ6IDExMixcbiAgICBza3U6ICdQWi1TSy05MDMnLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiAxMDUsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ09pbC1jb250cm9sIHNlcnVtIHdpdGggMTAlIE5pYWNpbmFtaWRlICsgMSUgWmluYyBQQ0EgZm9yIHNtb290aCBwb3JlbGVzcyBza2luLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnQ29udHJvbHMgZXhjZXNzIHNlYnVtIGluIGh1bWlkIHdlYXRoZXIsIG1pbmltaXplcyB2aXNpYmxlIHBvcmVzLCBhbmQgY2FsbXMgcmVkbmVzcyB3aXRob3V0IGRyeWluZyBvdXQgeW91ciBtb2lzdHVyZSBiYXJyaWVyLicsXG4gICAgZmVhdHVyZXM6IFsnMTAlIFB1cmUgTmlhY2luYW1pZGUnLCAnMSUgWmluYyBQQ0EgU2VidW0gQ29udHJvbCcsICdXYXRlci1MaWdodCBBYnNvcnB0aW9uJywgJ0ZyYWdyYW5jZS1GcmVlIEZvcm11bGEnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdWb2x1bWUnLCB2YWx1ZTogJzMwbWwgR2xhc3MgQm90dGxlJyB9LFxuICAgICAgeyBrZXk6ICdTa2luIFR5cGUnLCB2YWx1ZTogJ09pbHkgJiBDb21iaW5hdGlvbiBTa2luJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJzMwbWwgQm90dGxlJ10sXG4gICAgdGFnczogWyduaWFjaW5hbWlkZScsICdzZXJ1bScsICdvaWwgY29udHJvbCcsICdza2luY2FyZScsICd3b21lbiddLFxuICAgIGltYWdlczogW21ha2VQcm9kdWN0U3ZnKCdOaWFjaW5hbWlkZSAxMCUgU2VydW0nLCAnQmVhdXR5ICYgU2tpbmNhcmUnLCAnUG9yZSBDYXJlJyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnRmFzdCBzZWFsZWQgZGVsaXZlcnkgbmF0aW9ud2lkZS4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IGVhc3kgcmV0dXJuLicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IHRydWUsXG4gICAgaXNOZXdBcnJpdmFsOiB0cnVlXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Byb2QtYnJpZ2h0ZW5pbmctZGF5LWNyZWFtJyxcbiAgICBuYW1lOiAnRGFpbHkgQmFycmllciAmIEdsb3cgRmFjZSBDcmVhbScsXG4gICAgc2x1ZzogJ2RhaWx5LWJhcnJpZXItZ2xvdy1mYWNlLWNyZWFtJyxcbiAgICBicmFuZDogJ0F1cmEgQm90YW5pY2FscycsXG4gICAgY2F0ZWdvcnk6ICdCZWF1dHkgJiBTa2luY2FyZScsXG4gICAgcHJpY2U6IDEwNTAsXG4gICAgb2xkUHJpY2U6IDEzNTAsXG4gICAgc3RvY2s6IDM4LFxuICAgIHVuaXRzU29sZDogNjIsXG4gICAgc2t1OiAnUFotU0stOTA0JyxcbiAgICByYXRpbmc6IDQuNyxcbiAgICByZXZpZXdDb3VudDogNDksXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ0NlcmFtaWRlICsgUmljZSBXYXRlciBzb290aGluZyBtb2lzdHVyaXppbmcgY3JlYW0gZm9yIHNvZnQsIHJhZGlhbnQgZXZlcnlkYXkgc2tpbiAoNTBnKS4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ05vdXJpc2hlcyBhbmQgcmVwYWlycyBza2luIGJhcnJpZXIgYWxsIGRheSB3aXRoIEtvcmVhbi1pbnNwaXJlZCByaWNlIGV4dHJhY3QsIDUgZXNzZW50aWFsIGNlcmFtaWRlcywgYW5kIHBhbnRoZW5vbOKAlGJyZWF0aGFibGUgZXZlbiBpbiB3YXJtIHdlYXRoZXIuJyxcbiAgICBmZWF0dXJlczogWyc1eCBDZXJhbWlkZSBDb21wbGV4JywgJ0Zlcm1lbnRlZCBSaWNlIEV4dHJhY3QnLCAnNDgtSG91ciBNb2lzdHVyZSBMb2NrJywgJ1plcm8gSGVhdnkgUmVzaWR1ZSddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ05ldCBXZWlnaHQnLCB2YWx1ZTogJzUwZyBHbGFzcyBKYXInIH0sXG4gICAgICB7IGtleTogJ1NraW4gVHlwZScsIHZhbHVlOiAnRHJ5LCBOb3JtYWwgJiBTZW5zaXRpdmUnIH1cbiAgICBdLFxuICAgIG9wdGlvbnM6IFsnNTBnIEphciddLFxuICAgIHRhZ3M6IFsnY3JlYW0nLCAnZGF5IGNyZWFtJywgJ21vaXN0dXJpemVyJywgJ2NlcmFtaWRlJywgJ3NraW5jYXJlJywgJ3dvbWVuJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ0RhaWx5IEdsb3cgRmFjZSBDcmVhbScsICdCZWF1dHkgJiBTa2luY2FyZScsICdDZXJhbWlkZSA1MGcnKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdTZWFsZWQgYXV0aGVudGljIGphci4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IHJldHVybiBpZiBzZWFsIGludGFjdC4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiBmYWxzZSxcbiAgICBpc1RyZW5kaW5nOiBmYWxzZSxcbiAgICBpc05ld0Fycml2YWw6IHRydWVcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1jb2xsYWdlbi1uaWdodC1yZXBhaXItY3JlYW0nLFxuICAgIG5hbWU6ICdDb2xsYWdlbiAmIFNhZmZyb24gTmlnaHQgUmVwYWlyIENyZWFtJyxcbiAgICBzbHVnOiAnY29sbGFnZW4tc2FmZnJvbi1uaWdodC1yZXBhaXItY3JlYW0nLFxuICAgIGJyYW5kOiAnUm9vcEtvdGhhIFNraW5jYXJlJyxcbiAgICBjYXRlZ29yeTogJ0JlYXV0eSAmIFNraW5jYXJlJyxcbiAgICBwcmljZTogMTI5MCxcbiAgICBvbGRQcmljZTogMTY1MCxcbiAgICBzdG9jazogMzIsXG4gICAgdW5pdHNTb2xkOiA1NyxcbiAgICBza3U6ICdQWi1TSy05MDUnLFxuICAgIHJhdGluZzogNC45LFxuICAgIHJldmlld0NvdW50OiA2MSxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnT3Zlcm5pZ2h0IGZpcm1pbmcgJiBicmlnaHRlbmluZyBuaWdodCBjcmVhbSBlbnJpY2hlZCB3aXRoIEthc2htaXJpIHNhZmZyb24gYW5kIHBlcHRpZGVzLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnV2FrZXMgdXAgdGlyZWQgc2tpbiB3aXRoIGRlZXAgb3Zlcm5pZ2h0IGh5ZHJhdGlvbi4gRW5yaWNoZWQgd2l0aCBzYWZmcm9uIGV4dHJhY3QsIG1hcmluZSBjb2xsYWdlbiBwZXB0aWRlcywgYW5kIHNxdWFsYW5lIGZvciBzdXBwbGUgbW9ybmluZyBnbG93LicsXG4gICAgZmVhdHVyZXM6IFsnS2FzaG1pcmkgU2FmZnJvbiBFeHRyYWN0JywgJ0h5ZHJvbHl6ZWQgQ29sbGFnZW4gKyBQZXB0aWRlcycsICdEZWVwIE92ZXJuaWdodCBSZW5ld2FsJywgJ1BhcmFiZW4gJiBTdWxmYXRlIEZyZWUnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdOZXQgV2VpZ2h0JywgdmFsdWU6ICc1MGcgSmFyJyB9LFxuICAgICAgeyBrZXk6ICdSb3V0aW5lJywgdmFsdWU6ICdOaWdodCBTa2luY2FyZSBTdGVwJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJzUwZyBOaWdodCBKYXInXSxcbiAgICB0YWdzOiBbJ25pZ2h0IGNyZWFtJywgJ2NyZWFtJywgJ3NhZmZyb24nLCAnY29sbGFnZW4nLCAnc2tpbmNhcmUnLCAnd29tZW4nXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnU2FmZnJvbiBOaWdodCBDcmVhbScsICdCZWF1dHkgJiBTa2luY2FyZScsICdOaWdodCBSZXBhaXInKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdOYXRpb253aWRlIENhc2ggb24gRGVsaXZlcnkuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXR1cm4gaWYgdW5vcGVuZWQuJyxcbiAgICBpc0ZlYXR1cmVkOiB0cnVlLFxuICAgIGlzRmxhc2hTYWxlOiB0cnVlLFxuICAgIGlzVHJlbmRpbmc6IHRydWUsXG4gICAgaXNOZXdBcnJpdmFsOiBmYWxzZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLWh5ZHJhLW1hdHRlLXN1bnNjcmVlbicsXG4gICAgbmFtZTogJ0FxdWEgTWF0dGUgVVYgRGVmZW5zZSBHZWwgQ3JlYW0gU1BGIDUwKycsXG4gICAgc2x1ZzogJ2FxdWEtbWF0dGUtdXYtZGVmZW5zZS1nZWwtY3JlYW0tc3BmNTAnLFxuICAgIGJyYW5kOiAnRGVybWFQdXJlIEJEJyxcbiAgICBjYXRlZ29yeTogJ0JlYXV0eSAmIFNraW5jYXJlJyxcbiAgICBwcmljZTogODUwLFxuICAgIG9sZFByaWNlOiAxMDkwLFxuICAgIHN0b2NrOiA2NSxcbiAgICB1bml0c1NvbGQ6IDEzNCxcbiAgICBza3U6ICdQWi1TSy05MDYnLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiAxMTgsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ0Jyb2FkLXNwZWN0cnVtIFBBKysrKyB6ZXJvIHdoaXRlLWNhc3QgZ2VsIGNyZWFtIHN1bnNjcmVlbiBmb3IgZGFpbHkgb3V0ZG9vciBwcm90ZWN0aW9uLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnRmVhdGhlcmxpZ2h0IHdhdGVyeSBnZWwgY3JlYW0gdGhhdCBkaXNhcHBlYXJzIGluIHNlY29uZHMgd2l0aCB6ZXJvIHdoaXRlIGNhc3Qgb3Igc3dlYXRpbmVzc+KAlGlkZWFsIHVuZGVyIG1ha2V1cCBvciBiYXJlIHNraW4uJyxcbiAgICBmZWF0dXJlczogWydTUEYgNTArIFBBKysrKyBQcm90ZWN0aW9uJywgJ1plcm8gV2hpdGUgQ2FzdCAmIE5vbi1HcmVhc3knLCAnSW5mdXNlZCB3aXRoIENlbnRlbGxhICYgQWxvZScsICdXYXRlciAmIFN3ZWF0IFJlc2lzdGFudCddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ05ldCBXZWlnaHQnLCB2YWx1ZTogJzUwbWwgVHViZScgfSxcbiAgICAgIHsga2V5OiAnRmluaXNoJywgdmFsdWU6ICdTb2Z0IE1hdHRlJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJzUwbWwgVHViZSddLFxuICAgIHRhZ3M6IFsnc3Vuc2NyZWVuJywgJ2dlbCBjcmVhbScsICdzcGYgNTAnLCAnc2tpbmNhcmUnLCAnd29tZW4nXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnQXF1YSBNYXR0ZSBTUEYgNTArIENyZWFtJywgJ0JlYXV0eSAmIFNraW5jYXJlJywgJ1plcm8gQ2FzdCcpXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ1JlYWR5IHN0b2NrIGZvciBpbW1lZGlhdGUgZGlzcGF0Y2guJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXBsYWNlbWVudC4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiBmYWxzZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLXJvc2UtbGlwLWNoZWVrLXRpbnQnLFxuICAgIG5hbWU6ICdWZWx2ZXQgUm9zZSBMaXAgJiBDaGVlayBUaW50JyxcbiAgICBzbHVnOiAndmVsdmV0LXJvc2UtbGlwLWNoZWVrLXRpbnQnLFxuICAgIGJyYW5kOiAnQXVyYSBCb3RhbmljYWxzJyxcbiAgICBjYXRlZ29yeTogJ0JlYXV0eSAmIFNraW5jYXJlJyxcbiAgICBwcmljZTogNTkwLFxuICAgIG9sZFByaWNlOiA3ODAsXG4gICAgc3RvY2s6IDQ4LFxuICAgIHVuaXRzU29sZDogODEsXG4gICAgc2t1OiAnUFotQlQtOTA3JyxcbiAgICByYXRpbmc6IDQuNyxcbiAgICByZXZpZXdDb3VudDogNTQsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJ0xvbmctd2VhciBKb2pvYmEgJiBSb3NlaGlwIG5vdXJpc2hpbmcgdGludCBmb3IgbmF0dXJhbCByb3N5IGxpcHMgYW5kIGNoZWVrcy4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ0JsZW5kYWJsZSB2ZWx2ZXQtbWF0dGUgbGlwIGFuZCBjaGVlayB0aW50IGVucmljaGVkIHdpdGggcm9zZWhpcCBvaWwgYW5kIHZpdGFtaW4gRSBzbyBsaXBzIHN0YXkgc29mdCBhbGwgZGF5LicsXG4gICAgZmVhdHVyZXM6IFsnMi1pbi0xIExpcCAmIENoZWVrIEZvcm11bGEnLCAnSm9qb2JhICYgUm9zZWhpcCBJbmZ1c2VkJywgJ1NtdWRnZS1Qcm9vZiBOYXR1cmFsIEZpbmlzaCddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ1ZvbHVtZScsIHZhbHVlOiAnMTBtbCBBcHBsaWNhdG9yJyB9LFxuICAgICAgeyBrZXk6ICdTaGFkZXMnLCB2YWx1ZTogJ1Jvc2V3b29kIC8gQmVycnkgLyBQZWFjaCcgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydSb3Nld29vZCcsICdXYXJtIEJlcnJ5JywgJ1NvZnQgUGVhY2gnXSxcbiAgICB0YWdzOiBbJ2xpcCB0aW50JywgJ2JlYXV0eScsICdtYWtldXAnLCAnd29tZW4nXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnVmVsdmV0IFJvc2UgTGlwIFRpbnQnLCAnQmVhdXR5ICYgU2tpbmNhcmUnLCAnMi1pbi0xJyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnU2VhbGVkIGF1dGhlbnRpYyBjb3NtZXRpY3MuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXR1cm4gaWYgc2VhbGVkLicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLW1pbmltYWwtZGVzay1vcmdhbml6ZXInLFxuICAgIG5hbWU6ICdNaW5pbWFsIERlc2sgT3JnYW5pemVyJyxcbiAgICBzbHVnOiAnbWluaW1hbC1kZXNrLW9yZ2FuaXplcicsXG4gICAgYnJhbmQ6ICdXb29kQ3JhZnQgQkQnLFxuICAgIGNhdGVnb3J5OiAnSG9tZSBhbmQgTGl2aW5nJyxcbiAgICBwcmljZTogNzkwLFxuICAgIG9sZFByaWNlOiAxMDkwLFxuICAgIHN0b2NrOiA0OCxcbiAgICB1bml0c1NvbGQ6IDcxLFxuICAgIHNrdTogJ1BaLUhMLTEwMDEnLFxuICAgIHJhdGluZzogNC42LFxuICAgIHJldmlld0NvdW50OiA1NCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnTXVsdGktY29tcGFydG1lbnQgd2FsbnV0LWZpbmlzaCBkZXNrIGNhZGR5IGZvciBwaG9uZSwgcGVucywgbm90ZWJvb2tzICYgY2FibGVzLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnRGVjbHV0dGVyIHlvdXIgc3R1ZHkgb3Igd29yay1mcm9tLWhvbWUgdGFibGUgd2l0aCBoYW5kY3JhZnRlZCBtYXR0ZSB3YWxudXQgY29tcGFydG1lbnRzIGFuZCBjYWJsZSBwYXNzLXRocm91Z2guJyxcbiAgICBmZWF0dXJlczogWydFY28tRnJpZW5kbHkgRW5naW5lZXJlZCBXYWxudXQnLCAnNCBTbWFydCBDb21wYXJ0bWVudHMnLCAnQW50aS1TY3JhdGNoIEZlbHQgQmFzZSddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ0RpbWVuc2lvbnMnLCB2YWx1ZTogJzI0IHggMTQgeCAxMSBjbScgfSxcbiAgICAgIHsga2V5OiAnTWF0ZXJpYWwnLCB2YWx1ZTogJ1dhbG51dCBWZW5lZXIgV29vZCcgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWydXYWxudXQgQnJvd24nLCAnVGVhayBOYXR1cmFsJ10sXG4gICAgdGFnczogWydkZXNrJywgJ29yZ2FuaXplcicsICdob21lJywgJ29mZmljZSddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5oZXJvV29ya3NwYWNlLCBtYWtlUHJvZHVjdFN2ZygnTWluaW1hbCBEZXNrIE9yZ2FuaXplcicsICdIb21lIGFuZCBMaXZpbmcnLCAnV2FsbnV0JyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnU2FmZSBidWJibGUtd3JhcHBlZCBzaGlwcGluZy4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IGVhc3kgcmV0dXJuLicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwcm9kLWFyb21hLWRpZmZ1c2VyJyxcbiAgICBuYW1lOiAnQXJvbWEgRGlmZnVzZXIgd2l0aCBMRUQgTGlnaHQnLFxuICAgIHNsdWc6ICdhcm9tYS1kaWZmdXNlci1sZWQtbGlnaHQnLFxuICAgIGJyYW5kOiAnWmVuSG9tZScsXG4gICAgY2F0ZWdvcnk6ICdIb21lIGFuZCBMaXZpbmcnLFxuICAgIHByaWNlOiAxMzkwLFxuICAgIG9sZFByaWNlOiAxNzkwLFxuICAgIHN0b2NrOiAzMyxcbiAgICB1bml0c1NvbGQ6IDY0LFxuICAgIHNrdTogJ1BaLUhMLTEwMDInLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiA4MixcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMzAwbWwgdWx0cmFzb25pYyBjb29sLW1pc3QgaHVtaWRpZmllciAmIGVzc2VudGlhbCBvaWwgZGlmZnVzZXIgd2l0aCB3YXJtIG5pZ2h0IGdsb3cuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdDcmVhdGVzIGEgY2FsbWluZyBhdG1vc3BoZXJlIGluIGJlZHJvb21zIGFuZCB3b3Jrc3BhY2VzIHdpdGggd2hpc3Blci1xdWlldCBtaXN0aW5nIGFuZCBhdXRvIHNodXQtb2ZmIHByb3RlY3Rpb24uJyxcbiAgICBmZWF0dXJlczogWyczMDBtbCBUYW5rIChVcCB0byA4IEhvdXJzIE1pc3QpJywgJzcgU29vdGhpbmcgQW1iaWVudCBMRUQgQ29sb3JzJywgJ1VsdHJhLVF1aWV0IDwzMGRCIE9wZXJhdGlvbicsICdBdXRvIFdhdGVyLUxvdyBTaHV0b2ZmJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnQ2FwYWNpdHknLCB2YWx1ZTogJzMwMG1sJyB9LFxuICAgICAgeyBrZXk6ICdQb3dlcicsIHZhbHVlOiAnVVNCLUMgLyBBZGFwdGVyIEluY2x1ZGVkJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJ1dhcm0gQ3JlYW0nLCAnT2FrIEZpbmlzaCddLFxuICAgIHRhZ3M6IFsnZGlmZnVzZXInLCAnaHVtaWRpZmllcicsICdob21lIGxpdmluZycsICdkZWNvciddLFxuICAgIGltYWdlczogW21ha2VQcm9kdWN0U3ZnKCdBcm9tYSBEaWZmdXNlcicsICdIb21lIGFuZCBMaXZpbmcnLCAnMzAwbWwgTWlzdCcpLCBMT0NBTF9QSE9UT1MuaGVyb1dvcmtzcGFjZV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdJbnNpZGUgRGhha2EgMjQtNDhoLicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgcmVwbGFjZW1lbnQuJyxcbiAgICBpc0ZlYXR1cmVkOiBmYWxzZSxcbiAgICBpc0ZsYXNoU2FsZTogZmFsc2UsXG4gICAgaXNUcmVuZGluZzogdHJ1ZSxcbiAgICBpc05ld0Fycml2YWw6IGZhbHNlXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Byb2QtYWRqdXN0YWJsZS1kdW1iYmVsbCcsXG4gICAgbmFtZTogJ0FkanVzdGFibGUgRHVtYmJlbGwgU2V0JyxcbiAgICBzbHVnOiAnYWRqdXN0YWJsZS1kdW1iYmVsbC1zZXQnLFxuICAgIGJyYW5kOiAnSXJvbkZpdCBCRCcsXG4gICAgY2F0ZWdvcnk6ICdTcG9ydHMnLFxuICAgIHByaWNlOiAyODkwLFxuICAgIG9sZFByaWNlOiAzNTkwLFxuICAgIHN0b2NrOiAxNixcbiAgICB1bml0c1NvbGQ6IDM5LFxuICAgIHNrdTogJ1BaLVNQLTExMDEnLFxuICAgIHJhdGluZzogNC43LFxuICAgIHJldmlld0NvdW50OiA0NyxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMjBrZyB0b3RhbCBob21lIGd5bSBkdW1iYmVsbCAmIGJhcmJlbGwgY29udmVydGlibGUgc2V0IHdpdGggbm9uLXNsaXAgZ3JpcC4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ1RyYWluIGF0IGhvbWUgYW55dGltZSB3aXRoIGhlYXZ5LWR1dHkgZmxvb3Itc2FmZSBwbGF0ZXMsIGRvdWJsZSBzYWZldHkgbG9jayBjb2xsYXJzLCBhbmQgZm9hbS1wYWRkZWQgYmFyYmVsbCBjb25uZWN0b3IuJyxcbiAgICBmZWF0dXJlczogWydDb252ZXJ0aWJsZSBEdW1iYmVsbCAmIEJhcmJlbGwgTW9kZScsICdGbG9vci1TYWZlIFBFIENvYXRlZCBQbGF0ZXMnLCAnRG91YmxlIFNwaW4tTG9jayBTYWZldHkgTnV0cyddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ1RvdGFsIFdlaWdodCcsIHZhbHVlOiAnMjBrZyAoMTBrZyB4IDIpJyB9LFxuICAgICAgeyBrZXk6ICdJbmNsdWRlcycsIHZhbHVlOiAnMiBCYXJzLCAxIENvbm5lY3RvciwgMTIgUGxhdGVzJyB9XG4gICAgXSxcbiAgICBvcHRpb25zOiBbJzIwa2cgU2V0J10sXG4gICAgdGFnczogWydkdW1iYmVsbCcsICdmaXRuZXNzJywgJ2d5bScsICdzcG9ydHMnXSxcbiAgICBpbWFnZXM6IFttYWtlUHJvZHVjdFN2ZygnQWRqdXN0YWJsZSBEdW1iYmVsbCBTZXQnLCAnU3BvcnRzJywgJzIwa2cgSG9tZSBHeW0nKV0sXG4gICAgdmlkZW9Vcmw6ICcnLFxuICAgIHZpZGVvUG9zdGVyOiAnJyxcbiAgICBkZWxpdmVyeUluZm86ICdEb29yc3RlcCBkZWxpdmVyeSBpbnNpZGUgJiBvdXRzaWRlIERoYWthLicsXG4gICAgcmV0dXJuUG9saWN5OiAnNy1kYXkgZGFtYWdlIHJlcGxhY2VtZW50LicsXG4gICAgaXNGZWF0dXJlZDogZmFsc2UsXG4gICAgaXNGbGFzaFNhbGU6IGZhbHNlLFxuICAgIGlzVHJlbmRpbmc6IGZhbHNlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1raWRzLWJ1aWxkaW5nLWJsb2NrcycsXG4gICAgbmFtZTogJ0tpZHMgQnVpbGRpbmcgQmxvY2tzIFNldCcsXG4gICAgc2x1ZzogJ2tpZHMtYnVpbGRpbmctYmxvY2tzLXNldCcsXG4gICAgYnJhbmQ6ICdFZHVQbGF5JyxcbiAgICBjYXRlZ29yeTogJ1RveXMgYW5kIEtpZHMnLFxuICAgIHByaWNlOiAxMTkwLFxuICAgIG9sZFByaWNlOiAxNTkwLFxuICAgIHN0b2NrOiA0NCxcbiAgICB1bml0c1NvbGQ6IDc2LFxuICAgIHNrdTogJ1BaLVRLLTEyMDEnLFxuICAgIHJhdGluZzogNC45LFxuICAgIHJldmlld0NvdW50OiA2OCxcbiAgICBzaG9ydERlc2NyaXB0aW9uOiAnMTYwLXBpZWNlIG5vbi10b3hpYyBTVEVNIGNyZWF0aXZlIGJ1aWxkaW5nIGJsb2NrcyB3aXRoIHN0b3JhZ2UgdHViIGZvciBhZ2VzIDMrLicsXG4gICAgZnVsbERlc2NyaXB0aW9uOiAnQm9vc3QgY3JlYXRpdml0eSwgc3BhdGlhbCB0aGlua2luZywgYW5kIHNjcmVlbi1mcmVlIHBsYXl0aW1lIHdpdGggcm91bmRlZC1lZGdlIEJQQS1mcmVlIGNvbG9yZnVsIGludGVybG9ja2luZyBibG9ja3MuJyxcbiAgICBmZWF0dXJlczogWycxNjAgVmlicmFudCBTVEVNIFBpZWNlcycsICdCUEEtRnJlZSBSb3VuZGVkIFNhZmUgRWRnZXMnLCAnU3R1cmR5IFN0b3JhZ2UgQm94IEluY2x1ZGVkJ10sXG4gICAgc3BlY3M6IFtcbiAgICAgIHsga2V5OiAnUGllY2VzJywgdmFsdWU6ICcxNjAgUGllY2VzJyB9LFxuICAgICAgeyBrZXk6ICdBZ2UgR3JvdXAnLCB2YWx1ZTogJzMgLSAxMCBZZWFycycgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWycxNjAgUGNzIFNldCddLFxuICAgIHRhZ3M6IFsndG95cycsICdraWRzJywgJ2Jsb2NrcycsICdzdGVtJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ0tpZHMgQnVpbGRpbmcgQmxvY2tzJywgJ1RveXMgYW5kIEtpZHMnLCAnMTYwIFBjcyBTVEVNJyldLFxuICAgIHZpZGVvVXJsOiAnJyxcbiAgICB2aWRlb1Bvc3RlcjogJycsXG4gICAgZGVsaXZlcnlJbmZvOiAnR2lmdCB3cmFwcGluZyBub3RlIHN1cHBvcnRlZC4nLFxuICAgIHJldHVyblBvbGljeTogJzctZGF5IHJldHVybi4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiBmYWxzZSxcbiAgICBpc1RyZW5kaW5nOiBmYWxzZSxcbiAgICBpc05ld0Fycml2YWw6IHRydWVcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1iYW5nbGEtbm92ZWwtY29sbGVjdGlvbicsXG4gICAgbmFtZTogJ0Jlc3RzZWxsaW5nIEJhbmdsYSBOb3ZlbCBDb2xsZWN0aW9uJyxcbiAgICBzbHVnOiAnYmVzdHNlbGxpbmctYmFuZ2xhLW5vdmVsLWNvbGxlY3Rpb24nLFxuICAgIGJyYW5kOiAnQmFuZ2xhIEJvaSBHaGFyJyxcbiAgICBjYXRlZ29yeTogJ0Jvb2tzJyxcbiAgICBwcmljZTogODUwLFxuICAgIG9sZFByaWNlOiAxMTAwLFxuICAgIHN0b2NrOiA2MCxcbiAgICB1bml0c1NvbGQ6IDEyMSxcbiAgICBza3U6ICdQWi1CSy0xMzAxJyxcbiAgICByYXRpbmc6IDQuOSxcbiAgICByZXZpZXdDb3VudDogMTUzLFxuICAgIHNob3J0RGVzY3JpcHRpb246ICdDdXJhdGVkIDMtYm9vayBoYXJkY292ZXIgYm94IHNldCBvZiB0aW1lbGVzcyBtb2Rlcm4gQmFuZ2xhIGZpY3Rpb24gY2xhc3NpY3MuJyxcbiAgICBmdWxsRGVzY3JpcHRpb246ICdQcmludGVkIG9uIGNyZWFtIGFjaWQtZnJlZSBwYXBlciB3aXRoIGNyaXNwIEJlbmdhbGkgdHlwb2dyYXBoeSBhbmQgZHVyYWJsZSBoYXJkY292ZXIgYmluZGluZ+KAlHBlcmZlY3QgZm9yIHBlcnNvbmFsIGxpYnJhcmllcyBhbmQgZ2lmdGluZy4nLFxuICAgIGZlYXR1cmVzOiBbJzMgSGFyZGNvdmVyIENsYXNzaWMgVGl0bGVzJywgJzgwZ3NtIENyZWFtIFJlYWRpbmcgUGFwZXInLCAnUHJvdGVjdGl2ZSBDb2xsZWN0b3IgU2xpcGNhc2UnXSxcbiAgICBzcGVjczogW1xuICAgICAgeyBrZXk6ICdMYW5ndWFnZScsIHZhbHVlOiAnQmFuZ2xhJyB9LFxuICAgICAgeyBrZXk6ICdCaW5kaW5nJywgdmFsdWU6ICdIYXJkY292ZXIgQm94IFNldCcgfVxuICAgIF0sXG4gICAgb3B0aW9uczogWyczLUJvb2sgQm94IFNldCddLFxuICAgIHRhZ3M6IFsnYm9va3MnLCAnYmFuZ2xhJywgJ25vdmVsJywgJ2JvaW1lbGEnLCAnZ2lmdCddLFxuICAgIGltYWdlczogW0xPQ0FMX1BIT1RPUy5saWZlc3R5bGVGYXNoaW9uLCBtYWtlUHJvZHVjdFN2ZygnQmFuZ2xhIE5vdmVsIENvbGxlY3Rpb24nLCAnQm9va3MnLCAnMy1Cb29rIFNldCcpXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ0RlbGl2ZXJlZCBjYXJlZnVsbHkgaW4gd2F0ZXJwcm9vZiBwYWNrYWdpbmcuJyxcbiAgICByZXR1cm5Qb2xpY3k6ICc3LWRheSByZXBsYWNlbWVudCBmb3IgcHJpbnQgZGVmZWN0cy4nLFxuICAgIGlzRmVhdHVyZWQ6IGZhbHNlLFxuICAgIGlzRmxhc2hTYWxlOiBmYWxzZSxcbiAgICBpc1RyZW5kaW5nOiB0cnVlLFxuICAgIGlzTmV3QXJyaXZhbDogZmFsc2VcbiAgfSxcbiAge1xuICAgIGlkOiAncHJvZC1wcmVtaXVtLWhvbmV5LTUwMGcnLFxuICAgIG5hbWU6ICdQcmVtaXVtIEhvbmV5IDUwMGcnLFxuICAgIHNsdWc6ICdwcmVtaXVtLWhvbmV5LTUwMGcnLFxuICAgIGJyYW5kOiAnU3VuZGFyYmFuIFB1cmUnLFxuICAgIGNhdGVnb3J5OiAnR3JvY2VyaWVzJyxcbiAgICBwcmljZTogNjkwLFxuICAgIG9sZFByaWNlOiA4NTAsXG4gICAgc3RvY2s6IDcyLFxuICAgIHVuaXRzU29sZDogMTg2LFxuICAgIHNrdTogJ1BaLUdSLTE0MDEnLFxuICAgIHJhdGluZzogNC44LFxuICAgIHJldmlld0NvdW50OiAyMTEsXG4gICAgc2hvcnREZXNjcmlwdGlvbjogJzEwMCUgcmF3LCB1bmZpbHRlcmVkIFN1bmRhcmJhbiBuYXR1cmFsIG11bHRpZmxvcmFsIGhvbmV5IGluIGFpcnRpZ2h0IGdsYXNzIGphci4nLFxuICAgIGZ1bGxEZXNjcmlwdGlvbjogJ1NvdXJjZWQgZXRoaWNhbGx5IGZyb20gS2h1bG5hICYgU3VuZGFyYmFucyBiZWVrZWVwZXJzLiBMYWItdGVzdGVkIGZvciBwdXJpdHkgd2l0aCB6ZXJvIGFkZGVkIHN1Z2FyIG9yIGFydGlmaWNpYWwgc3lydXBzLicsXG4gICAgZmVhdHVyZXM6IFsnMTAwJSBQdXJlIFJhdyBVbmhlYXRlZCBIb25leScsICdMYWItVGVzdGVkIFplcm8gQWRkZWQgU3VnYXInLCAnSHlnaWVuaWMgU2VhbGVkIEdsYXNzIEphciddLFxuICAgIHNwZWNzOiBbXG4gICAgICB7IGtleTogJ05ldCBXZWlnaHQnLCB2YWx1ZTogJzUwMGcnIH0sXG4gICAgICB7IGtleTogJ09yaWdpbicsIHZhbHVlOiAnU3VuZGFyYmFucyBSZWdpb24sIEJhbmdsYWRlc2gnIH1cbiAgICBdLFxuICAgIG9wdGlvbnM6IFsnNTAwZyBHbGFzcyBKYXInXSxcbiAgICB0YWdzOiBbJ2hvbmV5JywgJ29yZ2FuaWMnLCAnZ3JvY2VyaWVzJywgJ3N1bmRhcmJhbicsICdmb29kJ10sXG4gICAgaW1hZ2VzOiBbbWFrZVByb2R1Y3RTdmcoJ1ByZW1pdW0gSG9uZXkgNTAwZycsICdHcm9jZXJpZXMnLCAnMTAwJSBQdXJlJyksIExPQ0FMX1BIT1RPUy5saWZlc3R5bGVGYXNoaW9uXSxcbiAgICB2aWRlb1VybDogJycsXG4gICAgdmlkZW9Qb3N0ZXI6ICcnLFxuICAgIGRlbGl2ZXJ5SW5mbzogJ0xlYWstcHJvb2YgY3VzaGlvbmVkIGJveCBkZWxpdmVyeS4nLFxuICAgIHJldHVyblBvbGljeTogJzEwMCUgcHVyaXR5IHNhdGlzZmFjdGlvbiBndWFyYW50ZWUuJyxcbiAgICBpc0ZlYXR1cmVkOiB0cnVlLFxuICAgIGlzRmxhc2hTYWxlOiB0cnVlLFxuICAgIGlzVHJlbmRpbmc6IHRydWUsXG4gICAgaXNOZXdBcnJpdmFsOiBmYWxzZVxuICB9XG5dO1xuXG5leHBvcnQgY29uc3QgU0VFRF9SRVZJRVdTID0gW1xuICB7XG4gICAgaWQ6ICdyZXYtMScsXG4gICAgcHJvZHVjdElkOiAncHJvZC1yZWRtaS1ub3RlLTEzJyxcbiAgICBwcm9kdWN0TmFtZTogJ1JlZG1pIE5vdGUgMTMgKDhHQi8xMjhHQiknLFxuICAgIGF1dGhvck5hbWU6ICdUYW52aXIgQWhtZWQnLFxuICAgIGNpdHk6ICdEaGFubW9uZGksIERoYWthJyxcbiAgICByYXRpbmc6IDUsXG4gICAgYXBwcm92ZWQ6IHRydWUsXG4gICAgY29tbWVudDogJ1JlY2VpdmVkIG15IFJlZG1pIE5vdGUgMTMgd2l0aGluIDIwIGhvdXJzIGluIERoYWthISBPZmZpY2lhbCBzZWFsIGludGFjdCBhbmQgQ2FzaCBvbiBEZWxpdmVyeSB3YXMgY29tcGxldGVseSBoYXNzbGUtZnJlZS4nXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Jldi0yJyxcbiAgICBwcm9kdWN0SWQ6ICdwcm9kLWFuYy1oZWFkcGhvbmVzJyxcbiAgICBwcm9kdWN0TmFtZTogJ1dpcmVsZXNzIE5vaXNlIENhbmNlbGxpbmcgSGVhZHBob25lcycsXG4gICAgYXV0aG9yTmFtZTogJ051c3JhdCBKYWhhbicsXG4gICAgY2l0eTogJ0JhbmFuaSwgRGhha2EnLFxuICAgIHJhdGluZzogNSxcbiAgICBhcHByb3ZlZDogdHJ1ZSxcbiAgICBjb21tZW50OiAnVGhlIEFOQyBibG9ja3Mgb3V0IHRyYWZmaWMgbm9pc2Ugb24gbXkgY29tbXV0ZS4gQmF0dGVyeSBlYXNpbHkgbGFzdHMgbWUgYSBmdWxsIHdvcmt3ZWVrIG9uIG9uZSBjaGFyZ2UuJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdyZXYtMycsXG4gICAgcHJvZHVjdElkOiAncHJvZC1sZW5vdm8taWRlYXBhZC0zJyxcbiAgICBwcm9kdWN0TmFtZTogJ0xlbm92byBJZGVhUGFkIFNsaW0gMyBDb3JlIGk1JyxcbiAgICBhdXRob3JOYW1lOiAnTWVoZWRpIEhhc2FuJyxcbiAgICBjaXR5OiAnQWdyYWJhZCwgQ2hhdHRvZ3JhbScsXG4gICAgcmF0aW5nOiA1LFxuICAgIGFwcHJvdmVkOiB0cnVlLFxuICAgIGNvbW1lbnQ6ICdCZXN0IHByaWNlIGluIEJEIGZvciB0aGUgMTN0aCBHZW4gaTUgMTZHQiB2YXJpYW50LiBDb3VyaWVyIHBhY2thZ2luZyB0byBDaGF0dG9ncmFtIHdhcyBzdXBlciBzZWN1cmUuJ1xuICB9LFxuICB7XG4gICAgaWQ6ICdyZXYtNCcsXG4gICAgcHJvZHVjdElkOiAncHJvZC1jb3R0b24tcGFuamFiaScsXG4gICAgcHJvZHVjdE5hbWU6ICdQcmVtaXVtIENvdHRvbiBQYW5qYWJpJyxcbiAgICBhdXRob3JOYW1lOiAnUmFmaXF1bCBJc2xhbScsXG4gICAgY2l0eTogJ1ppbmRhYmF6YXIsIFN5bGhldCcsXG4gICAgcmF0aW5nOiA1LFxuICAgIGFwcHJvdmVkOiB0cnVlLFxuICAgIGNvbW1lbnQ6ICdGYWJyaWMgaXMgZ2VudWluZWx5IGJyZWF0aGFibGUgY290dG9uIGFuZCBzdGl0Y2hpbmcgaXMgY2xlYW4uIE9yZGVyZWQgdHdvIG1vcmUgZm9yIG15IGJyb3RoZXJzLidcbiAgfSxcbiAge1xuICAgIGlkOiAncmV2LTUnLFxuICAgIHByb2R1Y3RJZDogJ3Byb2QtcHJlbWl1bS1ob25leS01MDBnJyxcbiAgICBwcm9kdWN0TmFtZTogJ1ByZW1pdW0gSG9uZXkgNTAwZycsXG4gICAgYXV0aG9yTmFtZTogJ0ZhcmhhbmEgWWFzbWluJyxcbiAgICBjaXR5OiAnVXR0YXJhLCBEaGFrYScsXG4gICAgcmF0aW5nOiA1LFxuICAgIGFwcHJvdmVkOiB0cnVlLFxuICAgIGNvbW1lbnQ6ICdBdXRoZW50aWMgU3VuZGFyYmFuIGhvbmV5IGFyb21hIGFuZCB0YXN0ZS4gTG92ZSB0aGF0IFBhemFybyBCRCBsZXRzIG1lIHBheSBlYXNpbHkgdmlhIGJLYXNoIG9yIENPRC4nXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Jldi02JyxcbiAgICBwcm9kdWN0SWQ6ICdwcm9kLXNtYXJ0LWZpdG5lc3Mtd2F0Y2gnLFxuICAgIHByb2R1Y3ROYW1lOiAnU21hcnQgRml0bmVzcyBXYXRjaCcsXG4gICAgYXV0aG9yTmFtZTogJ1NhamlkIFJhaG1hbicsXG4gICAgY2l0eTogJ1JhanNoYWhpJyxcbiAgICByYXRpbmc6IDQsXG4gICAgYXBwcm92ZWQ6IHRydWUsXG4gICAgY29tbWVudDogJ0FNT0xFRCBzY3JlZW4gaXMgc3VwZXIgYnJpZ2h0IHVuZGVyIHN1bmxpZ2h0IGFuZCBzdGVwIHRyYWNraW5nIGlzIGFjY3VyYXRlLiBEZWxpdmVyeSB0b29rIGp1c3QgMiBkYXlzLidcbiAgfVxuXTtcblxuZXhwb3J0IGNvbnN0IFNFRURfUE9TVFMgPSBbXG4gIHtcbiAgICBpZDogJ3Bvc3QtYnVkZ2V0LXBob25lcy1iZC0yMDI2JyxcbiAgICB0aXRsZTogJ1RvcCA1IFNtYXJ0cGhvbmVzIFVuZGVyIOCnszI1LDAwMCBpbiBCYW5nbGFkZXNoICgyMDI2IEJ1eWVyIEd1aWRlKScsXG4gICAgc2x1ZzogJ3RvcC1zbWFydHBob25lcy11bmRlci0yNTAwMC1iZCcsXG4gICAgY2F0ZWdvcnk6ICdCdXlpbmcgR3VpZGUnLFxuICAgIGNvdmVySW1hZ2U6IExPQ0FMX1BIT1RPUy5oZXJvVGVjaCxcbiAgICBleGNlcnB0OiAnQ29tcGFyZSBBTU9MRUQgZGlzcGxheXMsIGNhbWVyYSBzZW5zb3JzLCBhbmQgb2ZmaWNpYWwgd2FycmFudHkgcGVya3MgYmVmb3JlIHBpY2tpbmcgeW91ciBuZXh0IGV2ZXJ5ZGF5IHBob25lLicsXG4gICAgYm9keTogJzxwPkNob29zaW5nIGEgcmVsaWFibGUgc21hcnRwaG9uZSB1bmRlciA8c3Ryb25nPuCnszI1LDAwMDwvc3Ryb25nPiBpbiBCYW5nbGFkZXNoIGNvbWVzIGRvd24gdG8gZGlzcGxheSBxdWFsaXR5LCBiYXR0ZXJ5IGNoYXJnaW5nIHNwZWVkLCBhbmQgb2ZmaWNpYWwgd2FycmFudHkgc3VwcG9ydC48L3A+PGgzPjEuIFJlZG1pIE5vdGUgMTMgKDhHQi8xMjhHQik8L2gzPjxwPklmIHBob3RvZ3JhcGh5IGFuZCBhIGJyaWdodCAxMjBIeiBBTU9MRUQgc2NyZWVuIG1hdHRlciBtb3N0LCB0aGUgMTA4TVAgc2Vuc29yIGFuZCBzbGltIGJlemVscyBtYWtlIGl0IGEgc3RhbmRvdXQgZGFpbHkgZHJpdmVyIGF0IOCnszIxLDUwMC48L3A+PGgzPjIuIFNhbXN1bmcgR2FsYXh5IEExNTwvaDM+PHA+U2Ftc3VuZ+KAmXMgU3VwZXIgQU1PTEVEIHBhbmVsIGFuZCBsb25nLXRlcm0gc29mdHdhcmUgdXBkYXRlcyBnaXZlIHBlYWNlIG9mIG1pbmQgZm9yIGZhbWlsaWVzIGFuZCBwcm9mZXNzaW9uYWxzLjwvcD48aDM+My4gSW5maW5peCBIb3QgNDA8L2gzPjxwPkF0IOCnszE0LDUwMCwgc3R1ZGVudHMgYW5kIGNhc3VhbCBtb2JpbGUgZ2FtZXJzIGdldCB0cmVtZW5kb3VzIHZhbHVlIHdpdGggMzNXIGNoYXJnaW5nIGFuZCBzdGVyZW8gc3BlYWtlcnMuPC9wPicsXG4gICAgdGFnczogWydzbWFydHBob25lcycsICdidXlpbmcgZ3VpZGUnLCAnYmFuZ2xhZGVzaCddLFxuICAgIHB1Ymxpc2hlZDogdHJ1ZVxuICB9LFxuICB7XG4gICAgaWQ6ICdwb3N0LXdmaC1kZXNrLXNldHVwJyxcbiAgICB0aXRsZTogJ0hvdyB0byBCdWlsZCBhIENsZWFuIFN0dWR5ICYgRnJlZWxhbmNpbmcgRGVzayBVbmRlciDgp7M2NSwwMDAnLFxuICAgIHNsdWc6ICdmcmVlbGFuY2luZy1kZXNrLXNldHVwLWJkJyxcbiAgICBjYXRlZ29yeTogJ1RlY2ggVGlwcycsXG4gICAgY292ZXJJbWFnZTogTE9DQUxfUEhPVE9TLmhlcm9Xb3Jrc3BhY2UsXG4gICAgZXhjZXJwdDogJ1BhaXIgdGhlIHJpZ2h0IENvcmUgaTUgb3IgUnl6ZW4gNSBsYXB0b3Agd2l0aCBhIHF1aWV0IHdvcmtzcGFjZSBvcmdhbml6ZXIgYW5kIGJhY2t1cCBwb3dlciBlc3NlbnRpYWxzLicsXG4gICAgYm9keTogJzxwPldoZXRoZXIgeW91IGFyZSBhIHVuaXZlcnNpdHkgc3R1ZGVudCBvciByZW1vdGUgZnJlZWxhbmNlciBpbiBEaGFrYSwgYW4gZXJnb25vbWljLCBjbHV0dGVyLWZyZWUgZGVzayBib29zdHMgZm9jdXMgaW1tZWRpYXRlbHkuPC9wPjxwPlN0YXJ0IHdpdGggYSBmYXN0IE5WTWUgU1NEIGxhcHRvcCBsaWtlIHRoZSA8c3Ryb25nPkxlbm92byBJZGVhUGFkIFNsaW0gMyBDb3JlIGk1PC9zdHJvbmc+IG9yIDxzdHJvbmc+SFAgMTVzIFJ5emVuIDU8L3N0cm9uZz4sIGFkZCBhIDxzdHJvbmc+MjAwMDBtQWggUG93ZXIgQmFuazwvc3Ryb25nPiBmb3IgbG9hZC1zaGVkZGluZyBiYWNrdXAsIGFuZCBrZWVwIGNhYmxlcyB0aWR5IHdpdGggYSB3YWxudXQgZGVzayBvcmdhbml6ZXIuPC9wPicsXG4gICAgdGFnczogWydsYXB0b3AnLCAnZnJlZWxhbmNpbmcnLCAnd29ya3NwYWNlJ10sXG4gICAgcHVibGlzaGVkOiB0cnVlXG4gIH0sXG4gIHtcbiAgICBpZDogJ3Bvc3QtY29kLWJrYXNoLXNob3BwaW5nLXRpcHMnLFxuICAgIHRpdGxlOiAnU21hcnQgT25saW5lIFNob3BwaW5nIGluIEJhbmdsYWRlc2g6IENPRCwgYkthc2ggJiBXYXJyYW50eSBDaGVja2xpc3QnLFxuICAgIHNsdWc6ICdzbWFydC1vbmxpbmUtc2hvcHBpbmctYmQnLFxuICAgIGNhdGVnb3J5OiAnT2ZmZXJzICYgVGlwcycsXG4gICAgY292ZXJJbWFnZTogTE9DQUxfUEhPVE9TLmxpZmVzdHlsZUZhc2hpb24sXG4gICAgZXhjZXJwdDogJ0Fsd2F5cyBjaGVjayBTS1Ugc2VhbHMsIDctZGF5IHJldHVybiBjb3ZlcmFnZSwgYW5kIHJlYWwtdGltZSBvcmRlciB0cmFja2luZyBiZWZvcmUgYWNjZXB0aW5nIHBhcmNlbHMuJyxcbiAgICBib2R5OiAnPHA+T25saW5lIHNob3BwaW5nIGFjcm9zcyA2NCBkaXN0cmljdHMgaGFzIG5ldmVyIGJlZW4gZWFzaWVyLiBXaXRoIDxzdHJvbmc+UGF6YXJvIEJEPC9zdHJvbmc+LCBldmVyeSBvcmRlciBnZXRzIGEgdW5pcXVlIHRyYWNraW5nIGNvZGUgaW1tZWRpYXRlbHkgdXBvbiBjaGVja291dC48L3A+PHA+Q2hvb3NlIDxzdHJvbmc+Q2FzaCBvbiBEZWxpdmVyeTwvc3Ryb25nPiwgPHN0cm9uZz5iS2FzaDwvc3Ryb25nPiwgb3IgPHN0cm9uZz5OYWdhZDwvc3Ryb25nPiwgdHJhY2sgeW91ciBwYXJjZWwgbGl2ZSBvbiBvdXIgVHJhY2sgT3JkZXIgcGFnZSwgYW5kIGVuam95IHRyYW5zcGFyZW50IDctZGF5IHJldHVybnMuPC9wPicsXG4gICAgdGFnczogWydjb2QnLCAnYmthc2gnLCAnbmFnYWQnLCAnZGVsaXZlcnknXSxcbiAgICBwdWJsaXNoZWQ6IHRydWVcbiAgfVxuXTtcblxuZXhwb3J0IGNvbnN0IFNFRURfR0VORVJBTF9TRVRUSU5HUyA9IHtcbiAgaWQ6ICdnZW5lcmFsJyxcbiAgc2l0ZU5hbWU6ICdQYXphcm8gQkQnLFxuICB0YWdsaW5lOiAnWW91ciBCYXphYXIsIFNtYXJ0ZXInLFxuICBsb2dvVXJsOiAnJyxcbiAgZmF2aWNvblVybDogJycsXG4gIHBob25lOiAnKzg4MCAxNzAwLTAwMDAwMCcsXG4gIHdoYXRzYXBwOiAnODgwMTcwMDAwMDAwMCcsXG4gIGVtYWlsOiAnc3VwcG9ydEBwYXphcm9iZC5jb20nLFxuICBhZGRyZXNzOiAnSG91c2UgMjQsIFJvYWQgMTEsIEJhbmFuaSwgRGhha2EgMTIxMywgQmFuZ2xhZGVzaCcsXG4gIGZhY2Vib29rVXJsOiAnaHR0cHM6Ly9mYWNlYm9vay5jb20nLFxuICBpbnN0YWdyYW1Vcmw6ICdodHRwczovL2luc3RhZ3JhbS5jb20nLFxuICB5b3V0dWJlVXJsOiAnaHR0cHM6Ly95b3V0dWJlLmNvbScsXG4gIGluc2lkZURoYWthRmVlOiA2MCxcbiAgb3V0c2lkZURoYWthRmVlOiAxMjAsXG4gIGZyZWVEZWxpdmVyeU1pbjogNTAwMCxcbiAgY3VycmVuY3lTeW1ib2w6ICfgp7MnLFxuICBtYXBFbmFibGVkOiB0cnVlLFxuICBtYXBQcm92aWRlcjogJ29zbScsXG4gIG1hcERlZmF1bHRMYXQ6IDIzLjgxMDMsXG4gIG1hcERlZmF1bHRMbmc6IDkwLjQxMjUsXG4gIG1hcERlZmF1bHRab29tOiAxMixcbiAgZm9vdGVyVGV4dDogJ8KpIDIwMjYgUGF6YXJvIEJELiBZb3VyIEJhemFhciwgU21hcnRlci4gRGVsaXZlcmluZyBoYXBwaW5lc3MgYWNyb3NzIGFsbCA2NCBkaXN0cmljdHMgb2YgQmFuZ2xhZGVzaC4nLFxuICBtYWludGVuYW5jZU1vZGU6IGZhbHNlXG59O1xuXG5leHBvcnQgY29uc3QgU0VFRF9USEVNRV9TRVRUSU5HUyA9IHtcbiAgaWQ6ICd0aGVtZScsXG4gIGhlcm9WZXJzaW9uOiAyLFxuICBwcmltYXJ5Q29sb3I6ICcjMEY3NjZFJyxcbiAgYWNjZW50Q29sb3I6ICcjRkY2QjU3JyxcbiAgYmdDb2xvcjogJyNGQUY4RjUnLFxuICBoZXJvU2xpZGVzOiBbXG4gICAge1xuICAgICAgaWQ6ICdzbGlkZS0xJyxcbiAgICAgIGtpY2tlcjogJ0JhbmdsYWRlc2ggVGVjaCAmIExpZmVzdHlsZSBCYXphYXInLFxuICAgICAgaGVhZGxpbmU6ICdTbWFydCBHZWFyICYgRXZlcnlkYXkgRXNzZW50aWFscywgRGVsaXZlcmVkIEZhc3QnLFxuICAgICAgc3VidGV4dDogJ1Nob3AgdmVyaWZpZWQgcGhvbmVzLCBsYXB0b3BzLCBhdWRpbywgZmFzaGlvbiAmIGRhaWx5IHN0YXBsZXMgYWNyb3NzIDY0IGRpc3RyaWN0cyB3aXRoIENhc2ggb24gRGVsaXZlcnksIGJLYXNoICYgTmFnYWQuJyxcbiAgICAgIGJ1dHRvblRleHQ6ICdTaG9wIERlYWxzIE5vdycsXG4gICAgICBidXR0b25MaW5rOiAnI2RlYWxzJyxcbiAgICAgIGltYWdlVXJsOiBMT0NBTF9QSE9UT1MuaGVyb1RlY2gsXG4gICAgICBmZWF0dXJlZFByb2R1Y3RJZDogJ3Byb2QtcmVkbWktbm90ZS0xMycsXG4gICAgICBiYWRnZVRleHQ6ICdGbGFzaCBEZWFsIMK3IFNhdmUg4KezMiw1MDAnLFxuICAgICAgYW5pbVN0eWxlOiAnZmxvYXQnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3NsaWRlLTInLFxuICAgICAga2lja2VyOiAnV29yayAmIFN0dWR5IFVwZ3JhZGUnLFxuICAgICAgaGVhZGxpbmU6ICdMYXB0b3BzICYgTWluaW1hbCBXb3Jrc3BhY2UgUGlja3MgZm9yIDIwMjYnLFxuICAgICAgc3VidGV4dDogJ09mZmljaWFsIHdhcnJhbnR5IGxhcHRvcHMsIGZhc3QgR2FOIGNoYXJnZXJzLCBhbmQgY2FsbSBob21lLW9mZmljZSBhY2Nlc3NvcmllcyByZWFkeSBmb3IgbmV4dC1kYXkgRGhha2EgZGVsaXZlcnkuJyxcbiAgICAgIGJ1dHRvblRleHQ6ICdFeHBsb3JlIExhcHRvcHMnLFxuICAgICAgYnV0dG9uTGluazogJyNjYXRlZ29yeS9MYXB0b3BzJyxcbiAgICAgIGltYWdlVXJsOiBMT0NBTF9QSE9UT1MuaGVyb1dvcmtzcGFjZSxcbiAgICAgIGZlYXR1cmVkUHJvZHVjdElkOiAncHJvZC1sZW5vdm8taWRlYXBhZC0zJyxcbiAgICAgIGJhZGdlVGV4dDogJ09mZmljaWFsIDJZIFdhcnJhbnR5JyxcbiAgICAgIGFuaW1TdHlsZTogJ29yYml0J1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdzbGlkZS0zJyxcbiAgICAgIGtpY2tlcjogJ1N0dWRpbyBTb3VuZCAmIFdlYXJhYmxlcycsXG4gICAgICBoZWFkbGluZTogJ0RlZXAgQmFzcyBBTkMgSGVhZHBob25lcyAmIFNtYXJ0IEZpdG5lc3MgV2F0Y2hlcycsXG4gICAgICBzdWJ0ZXh0OiAnQ3J5c3RhbC1jbGVhciBjYWxscywgNDAtaG91ciBub2lzZSBjYW5jZWxsYXRpb24sIGFuZCBBTU9MRUQgaGVhbHRoIHRyYWNraW5nIGVuZ2luZWVyZWQgZm9yIGRhaWx5IGNvbW11dGVzLicsXG4gICAgICBidXR0b25UZXh0OiAnU2hvcCBBdWRpbycsXG4gICAgICBidXR0b25MaW5rOiAnI2NhdGVnb3J5L0hlYWRwaG9uZXMnLFxuICAgICAgaW1hZ2VVcmw6IExPQ0FMX1BIT1RPUy5hdWRpb0dhbWluZyxcbiAgICAgIGZlYXR1cmVkUHJvZHVjdElkOiAncHJvZC1hbmMtaGVhZHBob25lcycsXG4gICAgICBiYWRnZVRleHQ6ICc0MGggQU5DIMK3IEJlc3QgU2VsbGVyJyxcbiAgICAgIGFuaW1TdHlsZTogJ3B1bHNlJ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdzbGlkZS00JyxcbiAgICAgIGtpY2tlcjogJ1BybyBHYW1pbmcgJiBFc3BvcnRzJyxcbiAgICAgIGhlYWRsaW5lOiAnTG93LUxhdGVuY3kgQ29udHJvbGxlcnMgJiBSR0IgR2FtaW5nIFByZWNpc2lvbicsXG4gICAgICBzdWJ0ZXh0OiAnVXBncmFkZSB5b3VyIG1vYmlsZSBhbmQgUEMgYmF0dGxlc3RhdGlvbiB3aXRoIHRhY3RpbGUgd2lyZWxlc3MgZ2FtZXBhZHMgYW5kIHVsdHJhLWxpZ2h0d2VpZ2h0IGdhbWluZyBtaWNlLicsXG4gICAgICBidXR0b25UZXh0OiAnQnJvd3NlIEdhbWluZycsXG4gICAgICBidXR0b25MaW5rOiAnI2NhdGVnb3J5L0dhbWluZycsXG4gICAgICBpbWFnZVVybDogTE9DQUxfUEhPVE9TLmF1ZGlvR2FtaW5nLFxuICAgICAgZmVhdHVyZWRQcm9kdWN0SWQ6ICdwcm9kLXdpcmVsZXNzLWdhbWVwYWQnLFxuICAgICAgYmFkZ2VUZXh0OiAnWmVyby1MYWcgV2lyZWxlc3MnLFxuICAgICAgYW5pbVN0eWxlOiAnem9vbSdcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnc2xpZGUtNScsXG4gICAgICBraWNrZXI6ICdTbWFydCBIb21lICYgTm9uLVN0b3AgUG93ZXInLFxuICAgICAgaGVhZGxpbmU6ICczNjDCsCBXaS1GaSBTZWN1cml0eSAmIDIwLDAwMG1BaCBGYXN0IFBvd2VyIEJhbmtzJyxcbiAgICAgIHN1YnRleHQ6ICdLZWVwIHlvdXIgaG9tZSBwcm90ZWN0ZWQgd2l0aCBuaWdodC12aXNpb24gc21hcnQgY2FtZXJhcyBhbmQgc3RheSBjaGFyZ2VkIGR1cmluZyB0cmF2ZWwgb3IgbG9hZC1zaGVkZGluZy4nLFxuICAgICAgYnV0dG9uVGV4dDogJ0V4cGxvcmUgU21hcnQgSG9tZScsXG4gICAgICBidXR0b25MaW5rOiAnI2NhdGVnb3J5L1NtYXJ0JTIwSG9tZScsXG4gICAgICBpbWFnZVVybDogTE9DQUxfUEhPVE9TLnNtYXJ0RGV2aWNlcyxcbiAgICAgIGZlYXR1cmVkUHJvZHVjdElkOiAncHJvZC13aWZpLXNlY3VyaXR5LWNhbWVyYScsXG4gICAgICBiYWRnZVRleHQ6ICczNjDCsCBOaWdodCBWaXNpb24nLFxuICAgICAgYW5pbVN0eWxlOiAnZmxvYXQnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3NsaWRlLTYnLFxuICAgICAga2lja2VyOiAnRGVzaGkgSGVyaXRhZ2UgJiBTdHJlZXQgU3R5bGUnLFxuICAgICAgaGVhZGxpbmU6ICdCcmVhdGhhYmxlIENvdHRvbiBQYW5qYWJpICYgTW9kZXJuIEV2ZXJ5ZGF5IFNuZWFrZXJzJyxcbiAgICAgIHN1YnRleHQ6ICdDcmFmdGVkIHdpdGggc29mdCBCYW5nbGFkZXNoaSB3b3ZlbiBjb3R0b24gYW5kIG1pbmltYWxpc3QgZXZlcnlkYXkgY29tZm9ydCBidWlsdCBmb3IgYWxsIHNlYXNvbnMuJyxcbiAgICAgIGJ1dHRvblRleHQ6ICdTaG9wIEZhc2hpb24nLFxuICAgICAgYnV0dG9uTGluazogJyNjYXRlZ29yeS9GYXNoaW9uJyxcbiAgICAgIGltYWdlVXJsOiBMT0NBTF9QSE9UT1MubGlmZXN0eWxlRmFzaGlvbixcbiAgICAgIGZlYXR1cmVkUHJvZHVjdElkOiAncHJvZC1jb3R0b24tcGFuamFiaScsXG4gICAgICBiYWRnZVRleHQ6ICdUcmVuZGluZyBMaWZlc3R5bGUnLFxuICAgICAgYW5pbVN0eWxlOiAnb3JiaXQnXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3NsaWRlLTcnLFxuICAgICAga2lja2VyOiAnUHVyZSBIYXJ2ZXN0ICYgSG9tZSBXZWxsbmVzcycsXG4gICAgICBoZWFkbGluZTogJ1JhdyBTdW5kYXJiYW4gSG9uZXkgJiBOYXR1cmFsIExpdmluZyBTdGFwbGVzJyxcbiAgICAgIHN1YnRleHQ6ICdMYWItdGVzdGVkIHB1cml0eSBzZWFsZWQgc3RyYWlnaHQgZnJvbSB0aGUgaGl2ZSwgYWxvbmdzaWRlIHNvb3RoaW5nIExFRCBhcm9tYSBkaWZmdXNlcnMgZm9yIGNhbG0gZXZlbmluZ3MuJyxcbiAgICAgIGJ1dHRvblRleHQ6ICdTaG9wIEdyb2NlcmllcycsXG4gICAgICBidXR0b25MaW5rOiAnI2NhdGVnb3J5L0dyb2NlcmllcycsXG4gICAgICBpbWFnZVVybDogTE9DQUxfUEhPVE9TLmxpZmVzdHlsZUZhc2hpb24sXG4gICAgICBmZWF0dXJlZFByb2R1Y3RJZDogJ3Byb2QtcHJlbWl1bS1ob25leS01MDBnJyxcbiAgICAgIGJhZGdlVGV4dDogJzEwMCUgUHVyZSAmIFZlcmlmaWVkJyxcbiAgICAgIGFuaW1TdHlsZTogJ3B1bHNlJ1xuICAgIH1cbiAgXSxcbiAgcHJvbW9UaWxlczogW1xuICAgIHtcbiAgICAgIGlkOiAncHJvbW8tMScsXG4gICAgICB0aXRsZTogJ0F1ZGlvICYgR2FtaW5nIEdlYXInLFxuICAgICAgc3VidGV4dDogJ1VwIHRvIDMyJSBvZmYgQU5DIGhlYWRwaG9uZXMgJiBjb250cm9sbGVycycsXG4gICAgICBidXR0b25UZXh0OiAnU2hvcCBBdWRpbycsXG4gICAgICBsaW5rOiAnI2NhdGVnb3J5L0hlYWRwaG9uZXMnLFxuICAgICAgaW1hZ2VVcmw6IExPQ0FMX1BIT1RPUy5hdWRpb0dhbWluZ1xuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdwcm9tby0yJyxcbiAgICAgIHRpdGxlOiAnU21hcnQgSG9tZSAmIFBvd2VyJyxcbiAgICAgIHN1YnRleHQ6ICdDYW1lcmFzLCAyMDAwMG1BaCBwb3dlciBiYW5rcyAmIHNtYXJ0IExFRHMnLFxuICAgICAgYnV0dG9uVGV4dDogJ0V4cGxvcmUgVGVjaCcsXG4gICAgICBsaW5rOiAnI2NhdGVnb3J5L1NtYXJ0IEhvbWUnLFxuICAgICAgaW1hZ2VVcmw6IExPQ0FMX1BIT1RPUy5zbWFydERldmljZXNcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncHJvbW8tMycsXG4gICAgICB0aXRsZTogJ0Zhc2hpb24sIEJlYXV0eSAmIEJvb2tzJyxcbiAgICAgIHN1YnRleHQ6ICdQdXJlIGNvdHRvbiBQYW5qYWJpLCBzbmVha2VycyAmIEJhbmdsYSBjbGFzc2ljcycsXG4gICAgICBidXR0b25UZXh0OiAnQnJvd3NlIExpZmVzdHlsZScsXG4gICAgICBsaW5rOiAnI2NhdGVnb3J5L0Zhc2hpb24nLFxuICAgICAgaW1hZ2VVcmw6IExPQ0FMX1BIT1RPUy5saWZlc3R5bGVGYXNoaW9uXG4gICAgfVxuICBdXG59O1xuXG5leHBvcnQgY29uc3QgU0VFRF9BRFNfU0VUVElOR1MgPSB7XG4gIGlkOiAnYWRzJyxcbiAgc2xvdHM6IHtcbiAgICBhZF9oZXJvX2xlYWRlcmJvYXJkOiB7IGVuYWJsZWQ6IGZhbHNlLCBpbWFnZVVybDogJycsIGxpbmtVcmw6ICcnLCBodG1sQ29kZTogJycgfSxcbiAgICBhZF9taWRfcmVjdGFuZ2xlOiB7IGVuYWJsZWQ6IGZhbHNlLCBpbWFnZVVybDogJycsIGxpbmtVcmw6ICcnLCBodG1sQ29kZTogJycgfSxcbiAgICBhZF9mb290ZXJfYmFubmVyOiB7IGVuYWJsZWQ6IGZhbHNlLCBpbWFnZVVybDogJycsIGxpbmtVcmw6ICcnLCBodG1sQ29kZTogJycgfSxcbiAgICBhZF9zaWRlX2xlZnQ6IHsgZW5hYmxlZDogZmFsc2UsIGltYWdlVXJsOiAnJywgbGlua1VybDogJycsIGh0bWxDb2RlOiAnJyB9LFxuICAgIGFkX3NpZGVfcmlnaHQ6IHsgZW5hYmxlZDogZmFsc2UsIGltYWdlVXJsOiAnJywgbGlua1VybDogJycsIGh0bWxDb2RlOiAnJyB9LFxuICAgIGFkX3Byb2R1Y3RfcGFnZTogeyBlbmFibGVkOiBmYWxzZSwgaW1hZ2VVcmw6ICcnLCBsaW5rVXJsOiAnJywgaHRtbENvZGU6ICcnIH0sXG4gICAgYWRfYmxvZ19wb3N0OiB7IGVuYWJsZWQ6IGZhbHNlLCBpbWFnZVVybDogJycsIGxpbmtVcmw6ICcnLCBodG1sQ29kZTogJycgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgQkRfRElTVFJJQ1RTID0gW1xuICAnRGhha2EnLCAnR2F6aXB1cicsICdOYXJheWFuZ2FuaicsICdDaGF0dG9ncmFtJywgJ1N5bGhldCcsICdSYWpzaGFoaScsXG4gICdLaHVsbmEnLCAnQmFyaXNoYWwnLCAnUmFuZ3B1cicsICdNeW1lbnNpbmdoJywgJ0N1bWlsbGEnLCAnQm9ndXJhJyxcbiAgJ0NveFxcJ3MgQmF6YXInLCAnSmVzc29yZScsICdEaW5hanB1cicsICdUYW5nYWlsJywgJ05hcnNpbmdkaScsICdTYXZhcicsXG4gICdGYXJpZHB1cicsICdOb2FraGFsaScsICdGZW5pJywgJ0JyYWhtYW5iYXJpYScsICdLdXNodGlhJywgJ1BhYm5hJ1xuXTtcbiJdfQ==