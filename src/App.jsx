import React, { useState, useEffect, useRef } from "react";
import {
  Wifi, Phone, Tv, Bell, User, Home as HomeIcon, Zap, Headset,
  ChevronRight, ChevronLeft, Download, CreditCard, CheckCircle2,
  AlertTriangle, Clock, Camera, Gauge, ShieldCheck, MapPin,
  FileText, LogOut, Fingerprint, Globe, RefreshCw, Share2,
  CheckCircle, XCircle, PlusCircle, BarChart3, Router,
  Sparkles, Search, SlidersHorizontal, ChevronDown, Send, Edit3, Eye, EyeOff, PhoneMissed, PhoneOff, Volume2, MessageCircle
} from "lucide-react";

/* ============================================================
   CITYLINE — Customer App v2
   Brand tokens — pulled directly from the Cityline admin
   dashboard (navy sidebar + blue links + orange CTA accent),
   NOT the purple reference — same product, same identity.

   Ink (bg deep):      #0F1B2E
   Ink soft (panel):   #16273F
   Surface (app bg):   #F1F4F9
   Card:               #FFFFFF
   Accent blue:        #2F6FED   (primary brand, links, active states)
   Accent orange:      #F97316   (CTA — recharge, "add", urgent)
   Success:            #16A34A
   Warning:            #D97706
   Danger:             #DC2626
   Display font: Space Grotesk | Body font: Inter

   Signature element: the hero card's gradient goes navy → blue
   (a "signal traveling down the line" gradient), and the same
   two-tone gradient reappears on the floating recharge button
   and the receipt header — one motif, used three times, not
   scattered everywhere else.
   ============================================================ */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`;

const NAVY = "#0F1B2E";
const NAVY_SOFT = "#16273F";
const BLUE = "#2F6FED";
const ORANGE = "#F97316";
const SURFACE = "#F1F4F9";
const GRADIENT = "linear-gradient(135deg, #0F1B2E 0%, #1B3B73 55%, #2F6FED 100%)";
const CITYLINE_BLUE = "#213A8F";
const MUTED = "#64748B";        // Subtext on light backgrounds
const MUTED_ON_DARK = "#B9C7E6"; // Subtext on navy/gradient backgrounds
const MUTED_LABEL = "#94A3B8";   // Label tier — timestamps, tab captions, icons-with-text

/* ============================================================
   TYPE SCALE — locked. Every text element in this file uses one
   of these 7 sizes and one of the colors above. Do not introduce
   new px values or new muted colors outside this table.

   Token     Size     Weight              Color (on light)   Color (on dark)
   -------   ------   -----------------   -----------------   ---------------
   Display   28px     bold, Space Grotesk NAVY / brand         white
   H1        24px     bold, Space Grotesk NAVY                 white
   H2        19px     bold/semibold, SG   NAVY                 white
   H3        15px     semibold, Inter     NAVY                 white
   Body      13px     medium, Inter       NAVY                 white/90%
   Subtext   12px     regular, Inter      MUTED (#64748B)      MUTED_ON_DARK
   Label     10.5px   semibold, Inter     MUTED_LABEL (#94A3B8) MUTED_ON_DARK
   ============================================================ */

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx, cy, r, start, end) {
  const s = polarToCartesian(cx, cy, r, end);
  const e = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
}

function ringPath(cx, cy, r, thickness, startDeg, endDeg) {
  const outerR = r + thickness / 2, innerR = r - thickness / 2;
  const s = endDeg < startDeg ? endDeg + 360 : endDeg;
  return arcPath(cx, cy, r, startDeg, s);
}

// Approximates the real Cityline mark: 3 concentric broken rings (outer/middle/inner),
// uneven segment widths, open on the right where the wordmark's "C" sits alongside it.
const OUTER_RING = [
  { a0: 328, a1: 358, c: "#3E93D1" }, // top
  { a0: 2, a1: 42, c: "#D8434F" },    // upper-right
  { a0: 140, a1: 172, c: "#7A2048" }, // lower-right (maroon)
  { a0: 176, a1: 214, c: "#6E3FA3" }, // bottom (purple)
  { a0: 218, a1: 250, c: "#F2A63D" }, // lower-left (orange)
  { a0: 254, a1: 288, c: "#2FA6D9" }, // left (teal)
  { a0: 292, a1: 324, c: "#5B76B5" }, // upper-left (blue-grey)
];
const MIDDLE_RING = [
  { a0: 350, a1: 388, c: "#D8434F" }, // upper-right (red), wraps past 360
  { a0: 148, a1: 184, c: "#5EAE49" }, // bottom-right (green)
  { a0: 188, a1: 222, c: "#C43B4A" }, // bottom (red)
  { a0: 226, a1: 260, c: "#6E3FA3" }, // lower-left (purple)
  { a0: 264, a1: 300, c: "#C43B4A" }, // left (red)
];
const INNER_RING = [
  { a0: 355, a1: 388, c: "#2FA6D9" }, // upper-right (teal)
  { a0: 155, a1: 196, c: "#5EAE49" }, // bottom (green)
  { a0: 200, a1: 236, c: "#1E8C5A" }, // bottom-left (dark green)
  { a0: 240, a1: 276, c: "#C43B4A" }, // left (red)
];

function CitylineMark({ size = 56, withWordmark = false }) {
  const cx = 50, cy = 50;
  const rings = [
    { list: OUTER_RING, r: 44, t: 11 },
    { list: MIDDLE_RING, r: 32, t: 10 },
    { list: INNER_RING, r: 21, t: 9 },
  ];
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {rings.map((ring, ri) =>
          ring.list.map((seg, i) => (
            <path key={`${ri}-${i}`} d={arcPath(cx, cy, ring.r, seg.a0, seg.a1)} stroke={seg.c} strokeWidth={ring.t} fill="none" strokeLinecap="butt" />
          ))
        )}
      </svg>
      {withWordmark && (
        <span style={{ fontFamily: "'Poppins', sans-serif", color: CITYLINE_BLUE }} className="text-[24px] font-bold tracking-tight">cityline</span>
      )}
    </div>
  );
}

/* ---------------- Mock data ---------------- */

const CUSTOMER = { name: "Rajan Mehta", phone: "98765 43210", customerId: "RES-2026-0001", kyc: "Verified" };

// Multi-account support — one customer, multiple linked connections (residential + business)
const ACCOUNTS = [
  { id: "home", label: "Home", customerId: "RES-2026-0001", planName: "Sonic 200", speed: "200 Mbps", price: 1499, daysLeft: 13, expiry: "2026-07-20", dataUsed: 187, dataTotal: 500, unlimited: true, billPaid: true, billAmount: 1499, billCycle: "20 Jun – 20 Jul 2026", address: "B-402, Sunrise Heights, Andheri West, Mumbai 400058", landline: true, ott: true },
  { id: "office", label: "Office", customerId: "ENT-2026-0044", planName: "Enterprise ILL 100", speed: "100 Mbps", price: 15000, daysLeft: 22, expiry: "2026-07-30", dataUsed: 640, dataTotal: 2000, unlimited: false, billPaid: false, billAmount: 15000, billCycle: "01 Jul – 31 Jul 2026", address: "Level 5, Tower A, BKC Corporate Park, Bandra Kurla Complex, Mumbai 400051", landline: true, ott: false },
];

const SERVICES = [
  { id: "bb", type: "Broadband", icon: Wifi, plan: "Sonic 200", speed: "200 Mbps", validity: "1 Month", status: "active", expiry: "2026-07-20", daysLeft: 13, price: 1499, iconBg: "#E7EEFE", iconFg: BLUE },
  { id: "ll", type: "Landline", icon: Phone, plan: "Included with Sonic 200", status: "active", expiry: "2026-07-20", daysLeft: 13, iconBg: "#FDF0E7", iconFg: ORANGE },
  { id: "ott", type: "OTT", icon: Tv, plan: "Cityline TV Gold", status: "active", iconBg: "#EAF7EF", iconFg: "#16A34A", apps: [
      { name: "ZEE5 Premium", status: "active" }, { name: "SonyLIV", status: "active" }, { name: "Discovery+", status: "failed" },
  ]},
];

const ROUTER_INFO = { model: "Cityline ONT-X200", serial: "CTL-ONT-88213", uptime: "14d 6h", connectedDevices: 7, signal: 92 };

const CONNECTED_DEVICES = [
  { name: "Rajan's iPhone", mac: "A4:83:E7:22:11:9F", ip: "192.168.1.12", band: "5 GHz", status: "online", firstSeen: "12 May 2026" },
  { name: "MacBook Pro", mac: "F0:18:98:44:AA:1D", ip: "192.168.1.15", band: "5 GHz", status: "online", firstSeen: "12 May 2026" },
  { name: "LG Smart TV", mac: "88:C9:D0:11:74:03", ip: "192.168.1.20", band: "5 GHz", status: "online", firstSeen: "14 May 2026" },
  { name: "Alexa Echo Dot", mac: "34:D2:70:98:45:22", ip: "192.168.1.24", band: "2.4 GHz", status: "online", firstSeen: "22 May 2026" },
  { name: "iPad Air", mac: "A0:99:9B:12:55:AB", ip: "192.168.1.28", band: "5 GHz", status: "paired", firstSeen: "18 Jun 2026" },
  { name: "Xiaomi CCTV", mac: "58:CB:52:11:AA:9C", ip: "192.168.1.31", band: "2.4 GHz", status: "online", firstSeen: "01 Jul 2026" },
  { name: "Priya's OnePlus", mac: "C8:14:79:00:32:11", ip: "192.168.1.34", band: "5 GHz", status: "paired", firstSeen: "05 Jul 2026" },
  { name: "Unknown Realme", mac: "22:11:AF:99:00:14", ip: "—", band: "2.4 GHz", status: "blocked", firstSeen: "02 Jul 2026" },
  { name: "Unknown Redmi", mac: "3C:CD:36:11:44:55", ip: "—", band: "2.4 GHz", status: "blocked", firstSeen: "28 Jun 2026" },
];

const WIFI_SETTINGS = {
  ssid: "Cityline-Rajan-5G",
  password: "R@jan2026Fiber",
  band: "5 GHz + 2.4 GHz",
  security: "WPA2/WPA3",
  guestEnabled: false,
  guestSsid: "Cityline-Guest",
};

const CHAT_MESSAGES = [
  { from: "agent", name: "Anita from Cityline", text: "Hi Rajan! I'm Anita. How can I help you today?", time: "10:12 AM" },
  { from: "user", text: "My internet has been slow since morning.", time: "10:13 AM" },
  { from: "agent", name: "Anita from Cityline", text: "I understand. Let me check your line status.", time: "10:13 AM" },
  { from: "agent", name: "Anita from Cityline", text: "I can see there's a nearby OLT issue in Andheri West. Our engineers are on it. Expected fix: 2 hours.", time: "10:14 AM" },
  { from: "user", text: "Ok thanks. Should I raise a ticket?", time: "10:15 AM" },
  { from: "agent", name: "Anita from Cityline", text: "No need — I've logged this on your account. You'll get an update via SMS once resolved.", time: "10:15 AM" },
];

const HELPFUL_TIPS = [
  { icon: "wifi", title: "Get faster Wi-Fi at home", desc: "Position your router in a central spot, elevated, away from walls and appliances.", category: "Wi-Fi" },
  { icon: "gauge", title: "How to test your true speed", desc: "Always connect via Ethernet cable and close background apps before testing.", category: "Speed" },
  { icon: "router", title: "When to restart your router", desc: "A weekly restart clears cache and often fixes intermittent issues.", category: "Router" },
  { icon: "shield", title: "Secure your Wi-Fi password", desc: "Use a strong password mixing letters, numbers, and symbols. Change every 6 months.", category: "Security" },
  { icon: "tv", title: "Best OTT streaming setup", desc: "For 4K streaming, use a wired connection or 5 GHz Wi-Fi within 10 feet of the router.", category: "OTT" },
  { icon: "phone", title: "Landline not ringing?", desc: "Check the RJ11 cable, then restart your router. If still no dial tone, raise a ticket.", category: "Landline" },
];

const SERVICE_REQUESTS = [
  { id: "SR-2026-0812", type: "Relocation", status: "In progress", eta: "5 Aug 2026", raised: "28 Jul 2026", desc: "Shifting from Andheri West to Bandra East" },
  { id: "SR-2026-0788", type: "Router replacement", status: "Resolved", eta: "—", raised: "10 Jun 2026", desc: "Replaced faulty ONT with new unit" },
  { id: "SR-2026-0721", type: "Speed upgrade", status: "Resolved", eta: "—", raised: "22 May 2026", desc: "Upgraded from Sonic 100 to Sonic 200" },
];

const NEW_ORDERS = [
  { id: "ORD-2026-1104", type: "Wi-Fi Extender", status: "Out for delivery", eta: "26 Aug 2026", placed: "22 Aug 2026", amount: 2499 },
  { id: "ORD-2026-1089", type: "Static IP", status: "Activated", eta: "—", placed: "10 Jul 2026", amount: 500 },
];

const CANCELLATION = { active: false, message: "No active cancellation requests." };

const ADDONS = [
  { id: "a1", name: "Data Boost 100 GB", desc: "One-time top-up at current speed", price: 299, type: "data", icon: "data" },
  { id: "a2", name: "Data Boost 500 GB", desc: "One-time top-up at current speed", price: 999, type: "data", icon: "data" },
  { id: "a3", name: "OTT Super Pack", desc: "Add 5 more OTT apps (Netflix, Prime, JioCinema, Hoichoi, ALTBalaji)", price: 199, type: "ott", icon: "ott" },
  { id: "a4", name: "Static IP", desc: "Get a dedicated static IP address for your connection", price: 500, type: "network", icon: "network" },
  { id: "a5", name: "Wi-Fi Extender", desc: "Extend coverage across larger homes (one-time hardware)", price: 2499, type: "hardware", icon: "hardware" },
];

const FAQS = [
  { q: "How do I recharge my Cityline plan?", a: "Go to the Recharge tab, tap Recharge Now on your current plan, and pay via UPI, cards, or netbanking through Razorpay. Your plan is instantly extended once payment succeeds." },
  { q: "What if my internet stops working?", a: "First try restarting your router (Home → My WiFi → Router → Restart Router). If that doesn't help, run a diagnostics test. If issues persist, raise a ticket and our engineer will contact you." },
  { q: "How do I change my Wi-Fi password?", a: "Go to Home → My WiFi → Router → Change Wi-Fi Password. You'll need your current admin credentials." },
  { q: "Why is my speed lower than my plan?", a: "Wi-Fi speeds depend on your device, distance from the router, and interference. Run a speed test on the app while your device is close to the router. If the wired speed is also lower, raise a ticket." },
  { q: "Can I upgrade my plan mid-cycle?", a: "Yes. Go to Plans tab, select a new plan, and tap Request Change. Our team confirms within 24 hours and adjusts your billing on a pro-rated basis." },
  { q: "How do I set up auto-recharge?", a: "Go to Recharge → Auto-Recharge, enable it, and complete your UPI mandate. You won't be charged until 3 days before renewal." },
  { q: "How do I add another connection to my account?", a: "Go to Home → Account switcher → Link account. Select the connection type and enter the customer ID for verification." },
];

const TROUBLESHOOT_ISSUES = [
  {
    title: "Slow internet speed",
    steps: [
      "Restart your router (Home → My WiFi → Router → Restart Router)",
      "Move closer to the router or connect via Ethernet cable",
      "Close bandwidth-heavy apps on other devices",
      "Run a speed test to check current speeds",
      "If speeds remain low, raise a ticket for engineer diagnosis",
    ],
  },
  {
    title: "No internet at all",
    steps: [
      "Check if router lights are ON — power and PON lights should be green",
      "If PON light is red or off, this is a fiber-line issue — raise a ticket immediately",
      "Restart the router by unplugging power for 30 seconds",
      "Check if other devices in the home also have no internet",
      "If issue persists, call our support line for priority routing",
    ],
  },
  {
    title: "Wi-Fi keeps disconnecting",
    steps: [
      "Restart the router",
      "Check if the issue is on one specific device — if so, forget & reconnect the Wi-Fi on that device",
      "Move away from sources of interference (microwaves, thick walls)",
      "Consider a Wi-Fi Extender add-on if your home is large",
      "If all devices disconnect, raise a ticket",
    ],
  },
  {
    title: "OTT app not working",
    steps: [
      "Go to Home → OTT tile — check the app's activation status",
      "If it shows 'Failed', tap Retry to re-activate",
      "Log out and log back in on the OTT app itself",
      "If retry keeps failing, raise a support ticket",
    ],
  },
  {
    title: "Landline not working",
    steps: [
      "Check that the landline phone cable is plugged into the correct port on the router",
      "Restart the router",
      "Try making a call from a different handset if available",
      "If dial tone is missing, raise a ticket — this needs engineer visit",
    ],
  },
];

const OFFERS = [
  { title: "Upgrade to Sonic 300", sub: "Get 300 Mbps for just ₹500 more/month", tag: "Recommended for you" },
  { title: "Add OTT Super Pack", sub: "Bundle 5 more apps at 20% off", tag: "Limited time" },
  { title: "Refer & Earn ₹200", sub: "Get bill credit for every friend who joins", tag: "New" },
];

const PLAN_CATALOG = [
  { id: "p1", name: "Sonic 100", speed: "100 Mbps", price: 899, tenure: "1 Month", ott: "Cityline TV Basic", categories: ["popular"] },
  { id: "p2", name: "Sonic 200", speed: "200 Mbps", price: 1499, tenure: "1 Month", ott: "Cityline TV Gold", current: true, categories: ["popular", "ott"] },
  { id: "p3", name: "Sonic 200", speed: "200 Mbps", price: 14999, tenure: "1 Year", ott: "Cityline TV Gold", savings: "Save ₹2,989", categories: ["longterm", "ott"] },
  { id: "p4", name: "Sonic 300", speed: "300 Mbps", price: 1999, tenure: "1 Month", ott: "Cityline TV Gold + HD Add-on", categories: ["popular", "highspeed", "ott"] },
  { id: "p5", name: "Sonic 500", speed: "500 Mbps", price: 2999, tenure: "1 Month", ott: "Cityline TV Gold + HD Add-on", categories: ["highspeed", "ott"] },
  { id: "p6", name: "Data Boost 100GB", speed: "Same speed", price: 299, tenure: "One-time", ott: "—", categories: ["addon"] },
  { id: "p7", name: "OTT Super Pack", speed: "Add-on", price: 199, tenure: "1 Month", ott: "5 extra apps", categories: ["addon", "ott"] },
  { id: "p8", name: "Sonic 100 Annual", speed: "100 Mbps", price: 8999, tenure: "1 Year", ott: "Cityline TV Basic", savings: "Save ₹1,789", categories: ["longterm"] },
];

const PLAN_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "popular", label: "🔥 Popular" },
  { id: "addon", label: "Add-ons" },
  { id: "longterm", label: "Long-term" },
  { id: "highspeed", label: "High-speed" },
  { id: "ott", label: "OTT Bundles" },
];

const INVOICES = [
  { id: "INV-2026-0612", date: "2026-06-20", amount: 1499, status: "paid" },
  { id: "INV-2026-0511", date: "2026-05-20", amount: 1499, status: "paid" },
  { id: "INV-2026-0410", date: "2026-04-20", amount: 1499, status: "paid" },
];

const MONTHLY = [
  { m: "Feb", paid: 1499, pending: 0 }, { m: "Mar", paid: 1499, pending: 0 },
  { m: "Apr", paid: 1499, pending: 0 }, { m: "May", paid: 1499, pending: 0 },
  { m: "Jun", paid: 1499, pending: 0 }, { m: "Jul", paid: 0, pending: 1499 },
];

const TICKET_CATEGORIES = ["No Internet", "Slow Speed", "Billing Issue", "Landline Issue", "OTT Not Working", "Installation Request"];

const INITIAL_TICKETS = [
  { id: "TCK-1042", service: "Broadband", category: "Slow Speed", desc: "Speed dropped to 30 Mbps on my 200 Mbps plan since morning", status: "In Progress", created: "2026-07-05", timeline: [
      { label: "Ticket raised", done: true, time: "05 Jul, 10:12 AM" }, { label: "Assigned to engineer", done: true, time: "05 Jul, 11:40 AM" },
      { label: "In progress", done: true, time: "06 Jul, 09:00 AM" }, { label: "Resolved", done: false, time: null } ] },
  { id: "TCK-0998", service: "OTT", category: "OTT Not Working", desc: "ZEE5 shows 'subscription expired' but I paid last month", status: "Resolved", created: "2026-06-18", closed: "2026-06-19", timeline: [
      { label: "Ticket raised", done: true, time: "18 Jun, 3:20 PM" }, { label: "Assigned to engineer", done: true, time: "18 Jun, 4:00 PM" },
      { label: "In progress", done: true, time: "19 Jun, 10:00 AM" }, { label: "Resolved", done: true, time: "19 Jun, 1:15 PM" } ] },
];

const OUTAGE = { active: true, message: "Planned maintenance in Andheri West, 7–9 PM today. Service may be intermittent." };

const NOTIFICATIONS = [
  { id: 1, type: "payment", title: "Recharge due in 13 days", body: "Your Sonic 200 plan expires on 2026-07-20. Recharge now to avoid interruption.", time: "2h ago", unread: true },
  { id: 2, type: "ticket", title: "Ticket TCK-1042 updated", body: "Your engineer has started work on your slow-speed complaint.", time: "1d ago", unread: true },
  { id: 3, type: "outage", title: "Planned maintenance tonight", body: "Andheri West zone will see intermittent service, 7–9 PM today.", time: "3h ago", unread: true },
  { id: 4, type: "payment", title: "Payment received", body: "₹1,499 received for invoice INV-2026-0612. Thank you!", time: "17d ago", unread: false },
  { id: 5, type: "offer", title: "New: Sonic 300 upgrade", body: "Upgrade to 300 Mbps for just ₹500 more per month.", time: "3d ago", unread: false },
];

/* ---------------- Small UI atoms ---------------- */

function StatusPill({ status }) {
  const map = {
    active: { bg: "#EAF7EF", fg: "#16A34A", label: "Active", icon: CheckCircle },
    failed: { bg: "#FEEBEC", fg: "#DC2626", label: "Failed", icon: XCircle },
    suspended: { bg: "#FEF3E2", fg: "#D97706", label: "Suspended", icon: AlertTriangle },
    pending: { bg: "#E7EEFE", fg: BLUE, label: "Pending", icon: Clock },
  };
  const s = map[status] || map.active;
  const Icon = s.icon;
  return (
    <span style={{ background: s.bg, color: s.fg }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold">
      <Icon size={12} strokeWidth={2.5} /> {s.label}
    </span>
  );
}

function PrimaryButton({ children, onClick, full, tone = "orange", disabled, icon: Icon }) {
  const tones = {
    orange: { background: ORANGE, color: "#fff" },
    blue: { background: BLUE, color: "#fff" },
    dark: { background: NAVY, color: "#fff" },
    outline: { background: "transparent", color: NAVY, border: "1.5px solid " + NAVY },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...tones[tone], opacity: disabled ? 0.5 : 1 }}
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-semibold text-[13px] active:scale-[0.98] transition-transform`}>
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}

function ScreenHeader({ title, onBack, right, dark }) {
  return (
    <div className="flex items-center justify-between px-5 pt-9 pb-3 sticky top-0 z-10" style={{ background: dark ? "transparent" : SURFACE }}>
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 -ml-2 flex items-center justify-center rounded-full active:bg-black/5">
            <ChevronLeft size={20} color={dark ? "#fff" : NAVY} />
          </button>
        )}
        <h1 style={{ fontFamily: "'Poppins', sans-serif", color: dark ? "#fff" : NAVY }} className="text-[19px] font-bold">{title}</h1>
      </div>
      {right}
    </div>
  );
}

function Card({ children, style, className = "", onClick }) {
  return (
    <div onClick={onClick} style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06), 0 1px 2px rgba(15,27,46,0.04)", ...style }}
      className={`bg-white rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function FiberDial({ percent = 70, label, sub, color = "#fff", track = "rgba(255,255,255,0.2)" }) {
  const r = 40, c = 2 * Math.PI * r, offset = c - (percent / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke={track} strokeWidth="7" fill="none" />
        <circle cx="50" cy="50" r={r} stroke={color} strokeWidth="7" fill="none" strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontFamily: "'Poppins', sans-serif", color }} className="text-[19px] font-bold leading-none">{label}</span>
        <span style={{ color }} className="text-[10.5px] opacity-80 mt-1">{sub}</span>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "recharge", label: "Recharge", icon: CreditCard },
    { id: "support", label: "Support", icon: Headset },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white flex items-stretch" style={{ height: 68, borderTop: "1px solid #F1F4F9", paddingBottom: 6 }}>
      {items.map((it) => {
        const Icon = it.icon, active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 relative">
            {active && <span className="absolute top-0 w-8 h-0.5 rounded-full" style={{ background: BLUE }} />}
            <Icon size={18} color={active ? BLUE : "#94A3B8"} strokeWidth={2} />
            <span style={{ color: active ? BLUE : "#94A3B8", fontSize: "10px", lineHeight: 1 }} className="font-semibold whitespace-nowrap">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Screens ---------------- */

function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, []);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" style={{ background: NAVY }}>
      <div className="absolute w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, #2F6FED22 0%, transparent 70%)" }} />
      <div className="relative flex items-center justify-center mb-6" style={{ width: 100, height: 100 }}>
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#2F6FED22" }} />
        <div className="w-full h-full rounded-3xl flex items-center justify-center p-3" style={{ background: "#fff" }}>
          <CitylineMark size={68} />
        </div>
      </div>
      <h1 style={{ fontFamily: "'Poppins', sans-serif" }} className="text-white text-[24px] font-bold tracking-tight">cityline</h1>
      <p className="text-[#B9C7E6] text-[13px] mt-1">Fast. Reliable. Always on.</p>
    </div>
  );
}

function LoginScreen({ onLoggedIn }) {
  const [stage, setStage] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const handleOtpChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) inputsRef.current[i + 1]?.focus();
  };
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" style={{ background: "#fff" }}>
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: "#E7EEFE" }} />
      <div className="absolute -left-20 top-40 w-40 h-40 rounded-full" style={{ background: "#FDF0E7", opacity: 0.6 }} />

      <div className="px-6 pt-16 relative">
        <CitylineMark size={44} withWordmark />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 relative">
        {stage === "phone" ? (
          <>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[24px] font-bold mb-1">Welcome back</h1>
            <p className="text-[#64748B] text-[13px] mb-8">Enter your registered mobile number to continue.</p>
            <label className="text-[12px] font-semibold text-[#64748B] mb-1.5">MOBILE NUMBER</label>
            <div className="flex items-center bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 mb-6 focus-within:border-blue-500">
              <span style={{ color: NAVY }} className="font-semibold mr-2">+91</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210" className="flex-1 outline-none text-[15px] font-semibold bg-transparent" style={{ color: NAVY }} />
            </div>
            <PrimaryButton full tone="blue" disabled={phone.length !== 10} onClick={() => setStage("otp")}>Send OTP</PrimaryButton>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[24px] font-bold mb-1">Verify it's you</h1>
            <p className="text-[#64748B] text-[13px] mb-8">Enter the 4-digit code sent to +91 {phone}.</p>
            <div className="flex gap-3 mb-6">
              {otp.map((d, i) => (
                <input key={i} ref={(el) => (inputsRef.current[i] = el)} value={d} onChange={(e) => handleOtpChange(i, e.target.value)} maxLength={1}
                  className="w-14 h-14 text-center text-[19px] font-bold bg-white border border-[#E2E8F0] rounded-2xl outline-none focus:border-blue-500" style={{ color: NAVY }} />
              ))}
            </div>
            <button style={{ color: ORANGE }} className="text-[13px] font-semibold mb-6">Resend code in 00:28</button>
            <PrimaryButton full tone="blue" disabled={otp.some((d) => d === "")} onClick={onLoggedIn}>Verify & Continue</PrimaryButton>
          </>
        )}
      </div>

      <div className="relative">
        <div className="h-1.5 w-full flex">
          {[...OUTER_RING, ...MIDDLE_RING].map((s, i) => <div key={i} className="flex-1" style={{ background: s.c }} />)}
        </div>
        <p className="text-center text-[12px] text-[#94A3B8] py-4">By continuing you agree to Cityline's Terms & Privacy Policy</p>
      </div>
    </div>
  );
}

function OutageBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!OUTAGE.active || dismissed) return null;
  return (
    <div className="mx-5 mb-4 rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFFAF0", border: "1px solid #FDE9C8" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3E2" }}>
        <AlertTriangle size={16} color="#D97706" />
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-bold text-[#8A5A0C] mb-0.5">Maintenance alert</p>
        <p className="text-[12px] leading-snug text-[#8A5A0C]/90">{OUTAGE.message}</p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-[#8A5A0C]/60 text-[15px] leading-none px-1">×</button>
    </div>
  );
}

function HomeScreen({ goto, goBack }) {
  const [accountId, setAccountId] = useState(ACCOUNTS[0].id);
  const [notifsViewed, setNotifsViewed] = useState(false);
  const account = ACCOUNTS.find((a) => a.id === accountId);
  const dataPct = Math.round((account.dataUsed / account.dataTotal) * 100);
  const hasUnread = !notifsViewed && NOTIFICATIONS.some((n) => n.unread);

  const SectionHeader = ({ title, action, onAction }) => (
    <div className="px-5 mb-3 flex items-center justify-between">
      <p className="text-[15px] font-bold" style={{ color: NAVY }}>{title}</p>
      {action && (
        <button onClick={onAction} style={{ color: ORANGE }} className="text-[12px] font-semibold flex items-center gap-0.5">
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );

  const HubTile = ({ icon: Icon, label, bg, fg, action }) => (
    <button onClick={action} className="flex flex-col items-center gap-2">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
        <Icon size={18} color={fg} />
      </div>
      <span className="font-semibold text-center leading-tight" style={{ color: NAVY, fontSize: "11px" }}>{label}</span>
    </button>
  );

  return (
    <div>
      {/* Header: greeting + notifications */}
      <div className="px-5 pt-9 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-[13px]" style={{ background: GRADIENT }}>RM</div>
          <div>
            <p className="text-[12px] text-[#64748B]">Good evening,</p>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold leading-tight">{CUSTOMER.name}</h1>
          </div>
        </div>
        <button onClick={() => { setNotifsViewed(true); goto("notifications"); }} className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.08)" }}>
          <Bell size={18} color={NAVY} />
          {hasUnread && <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full" style={{ background: "#DC2626" }} />}
        </button>
      </div>

      {/* Block 1: Account switcher */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {ACCOUNTS.map((a) => {
          const active = accountId === a.id;
          return (
            <button key={a.id} onClick={() => setAccountId(a.id)}
              className="rounded-2xl px-3 py-2 flex flex-col items-start shrink-0"
              style={{
                background: active ? "#fff" : "transparent",
                border: active ? `1.5px solid ${BLUE}` : "1.5px solid #E2E8F0",
                minWidth: 140,
                boxShadow: active ? "0 1px 3px rgba(15,27,46,0.06)" : "none",
              }}>
              <div className="flex items-center gap-1.5">
                {active && <CheckCircle2 size={12} color={BLUE} />}
                <span className="text-[12px] font-bold" style={{ color: active ? BLUE : NAVY }}>{a.label}</span>
              </div>
              <span className="text-[10.5px] font-semibold" style={{ color: MUTED_LABEL }}>{a.customerId}</span>
            </button>
          );
        })}
        <button onClick={() => goto("linkAccount")}
          className="rounded-2xl px-3 py-2 flex items-center gap-2 shrink-0"
          style={{ border: "1.5px dashed #CBD5E1", minWidth: 130 }}>
          <PlusCircle size={16} color={BLUE} />
          <span className="text-[12px] font-semibold" style={{ color: BLUE }}>Link account</span>
        </button>
      </div>

      {/* Block 2: Hero card — plan + renewal */}
      <div className="mx-5 mb-4 rounded-3xl p-4 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06), 0 1px 2px rgba(15,27,46,0.04)" }}>
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, #E7EEFE 0%, transparent 70%)" }} />
        <div className="absolute -right-4 top-10 w-24 h-24 rounded-full" style={{ background: "radial-gradient(circle, #EAF7EF 0%, transparent 70%)" }} />
        <div className="flex items-center justify-between relative mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E7EEFE" }}>
            <Wifi size={16} color={BLUE} />
          </div>
          <StatusPill status="active" />
        </div>
        <p className="text-[#64748B] text-[12px] relative">{account.label === "Home" ? "Broadband" : "Enterprise ILL"} · {account.speed}</p>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold relative">{account.planName}</h2>

        <div className="flex items-center justify-between mt-3 pt-3 relative" style={{ borderTop: "1.5px dashed #E2E8F0" }}>
          <div>
            <p className="text-[10.5px] text-[#94A3B8] font-bold tracking-wide">RENEWAL AMOUNT</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[24px] font-bold">₹{account.price.toLocaleString("en-IN")}</p>
          </div>
          <FiberDial percent={68} label={`${account.daysLeft}d`} sub="left" color={BLUE} track="#EAF0FB" />
        </div>
        <button onClick={() => goto("recharge")} className="mt-3 w-full rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-[13px] relative" style={{ background: ORANGE, color: "#fff" }}>
          <Zap size={16} /> Recharge Now
        </button>
      </div>

      <OutageBanner />

      {/* Other services chips — only show services user actually has */}
      {(account.landline || account.ott) && (
        <div className="px-5 mb-5 flex gap-2">
          {account.landline && (
            <button onClick={() => goto("service", "ll")} className="flex-1 rounded-2xl bg-white p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDF0E7" }}><Phone size={16} color={ORANGE} /></div>
              <div className="text-left">
                <p className="text-[12px] font-bold" style={{ color: NAVY }}>Landline</p>
                <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>Active</p>
              </div>
            </button>
          )}
          {account.ott && (
            <button onClick={() => goto("service", "ott")} className="flex-1 rounded-2xl bg-white p-3 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EAF7EF" }}><Tv size={16} color="#16A34A" /></div>
              <div className="text-left">
                <p className="text-[12px] font-bold" style={{ color: NAVY }}>OTT</p>
                <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>3 apps</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Block 3: Data usage widget — conditional on plan type */}
      <SectionHeader title="Data usage" />
      <div className="mx-5 mb-5">
        {account.unlimited ? (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#EAF7EF" }}>
                <CheckCircle2 size={18} color="#16A34A" />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">Unlimited data</p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTED }}>Enjoy uncapped fiber at full speed</p>
              </div>
              <span className="text-[19px] font-bold" style={{ color: "#16A34A" }}>∞</span>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-baseline gap-1 mb-2">
              <span style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[24px] font-bold">{account.dataUsed}</span>
              <span className="text-[13px] font-semibold" style={{ color: NAVY }}>GB used</span>
              <span className="text-[12px] font-semibold ml-auto" style={{ color: MUTED }}>of {account.dataTotal} GB</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "#EAF0FB" }}>
              <div className="h-full rounded-full" style={{ width: `${dataPct}%`, background: `linear-gradient(90deg, ${BLUE}, #4F86F0)` }} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{100 - dataPct}% remaining</span>
              <span className="text-[12px] font-semibold" style={{ color: NAVY }}>Resets {new Date(account.expiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
            </div>
          </Card>
        )}
      </div>

      {/* Block 4: Latest bill card */}
      <SectionHeader title="Latest bill" action="View all" onAction={() => goto("recharge")} />
      <div className="mx-5 mb-5">
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[24px] font-bold">₹{account.billAmount.toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {account.billPaid ? <CheckCircle2 size={16} color="#16A34A" /> : <Clock size={16} color={ORANGE} />}
                <span className="text-[12px] font-semibold" style={{ color: account.billPaid ? "#16A34A" : ORANGE }}>{account.billPaid ? "Bill paid" : "Payment due"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F1F4F9" }}>
            <span className="text-[12px] font-semibold" style={{ color: MUTED }}>Bill cycle</span>
            <span className="text-[12px] font-semibold" style={{ color: NAVY }}>{account.billCycle}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => goto("receipt", INVOICES[0])} className="rounded-xl py-2.5 text-[13px] font-bold border" style={{ borderColor: BLUE, color: BLUE }}>View details</button>
            <button onClick={() => goto("recharge")} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: BLUE, color: "#fff" }}>{account.billPaid ? "Pay advance" : "Pay now"}</button>
          </div>
        </Card>
      </div>

      {/* Block 8: Useful links — compact preview (3 tiles) */}
      <SectionHeader title="Useful links" action="View all" onAction={() => goto("usefulLinks")} />
      <div className="mx-5 mb-5">
        <Card>
          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
            <HubTile icon={Clock} label="Track" bg="#E7EEFE" fg={BLUE} action={() => goto("trackServiceRequest")} />
            <HubTile icon={MapPin} label="Relocate" bg="#E7EEFE" fg={BLUE} action={() => goto("relocate")} />
            <HubTile icon={FileText} label="Orders" bg="#E7EEFE" fg={BLUE} action={() => goto("trackOrder")} />
          </div>
        </Card>
      </div>


      {/* Offers */}
      <SectionHeader title="Offers for you" />
      <div className="pl-5 flex gap-3 overflow-x-auto mb-5" style={{ scrollbarWidth: "none" }}>
        {OFFERS.map((o, i) => (
          <div key={i} className="min-w-[240px] rounded-2xl p-4 relative overflow-hidden shrink-0" style={{ background: i === 0 ? GRADIENT : i === 1 ? "linear-gradient(135deg,#D97706,#F97316)" : "linear-gradient(135deg,#0F1B2E,#334155)" }}>
            <Sparkles size={16} color="rgba(255,255,255,0.6)" className="absolute top-3 right-3" />
            <span className="text-[10.5px] font-bold text-white/70">{o.tag}</span>
            <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-white text-[15px] font-bold mt-1 mb-1">{o.title}</p>
            <p className="text-white/80 text-[12px]">{o.sub}</p>
          </div>
        ))}
        <div className="w-2 shrink-0" />
      </div>

      {/* Recent activity */}
      <SectionHeader title="Recent activity" action="All tickets" onAction={() => goto("support")} />
      <div className="mx-5 mb-6">
        <Card style={{ padding: 0 }}>
          <button onClick={() => goto("ticketDetail", { ticket: INITIAL_TICKETS[0], from: "home" })} className="w-full flex items-center justify-between p-4" style={{ borderBottom: "1px solid #F1F4F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FDF0E7" }}><Headset size={16} color={ORANGE} /></div>
              <div className="text-left">
                <p className="text-[13px] font-semibold" style={{ color: NAVY }}>{INITIAL_TICKETS[0].category}</p>
                <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{INITIAL_TICKETS[0].id} · 2 hours ago</p>
              </div>
            </div>
            <StatusPill status="pending" />
          </button>
          <button onClick={() => goto("receipt", INVOICES[0])} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EAF7EF" }}><CheckCircle2 size={16} color="#16A34A" /></div>
              <div className="text-left">
                <p className="text-[13px] font-semibold" style={{ color: NAVY }}>Recharge paid</p>
                <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{INVOICES[0].id} · Yesterday</p>
              </div>
            </div>
            <span className="text-[13px] font-bold" style={{ color: NAVY }}>₹{INVOICES[0].amount}</span>
          </button>
        </Card>
      </div>
    </div>
  );
}

function StatsScreen({ goto, goBack }) {
  const max = 1600;
  const totalPaid = MONTHLY.reduce((a, m) => a + m.paid, 0);
  return (
    <div className="pb-6">
      <div style={{ background: NAVY }} className="pb-6 rounded-b-[32px]">
        <ScreenHeader title="Billing Statistics" onBack={goBack} dark />
        <div className="px-5 mt-2">
          <p className="text-[#B9C7E6] text-[12px]">Total paid (last 6 months)</p>
          <h2 style={{ fontFamily: "'Poppins', sans-serif" }} className="text-white text-[28px] font-bold mt-1">₹{totalPaid.toLocaleString("en-IN")}</h2>
        </div>
      </div>

      <div className="px-5 -mt-4">
        <Card>
          <p className="text-[13px] font-semibold mb-4" style={{ color: NAVY }}>Monthly overview</p>
          <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
            {MONTHLY.map((m) => (
              <div key={m.m} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full flex items-end justify-center gap-1" style={{ height: 110 }}>
                  <div className="rounded-t-md" style={{ width: 10, height: `${(m.paid / max) * 110}px`, background: BLUE }} />
                  <div className="rounded-t-md" style={{ width: 10, height: `${(m.pending / max) * 110}px`, background: m.pending ? ORANGE : "#E2E8F0" }} />
                </div>
                <span className="text-[10.5px] text-[#64748B]">{m.m}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: BLUE }} />Paid</span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]"><span className="w-2.5 h-2.5 rounded-full" style={{ background: ORANGE }} />Pending</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: "#EAF7EF" }}><CheckCircle2 size={16} color="#16A34A" /></div>
            <p className="text-[15px] font-bold" style={{ color: NAVY }}>5 / 6</p>
            <p className="text-[12px] text-[#64748B]">Months paid on time</p>
          </Card>
          <Card>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: "#FDF0E7" }}><Clock size={16} color={ORANGE} /></div>
            <p className="text-[15px] font-bold" style={{ color: NAVY }}>₹1,499</p>
            <p className="text-[12px] text-[#64748B]">Due this month</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PlansScreen({ goto, goBack }) {
  const bb = SERVICES.find((s) => s.id === "bb");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [requestOpen, setRequestOpen] = useState(null);
  const [retryOpen, setRetryOpen] = useState(null);

  const filteredPlans = PLAN_CATALOG.filter((p) => {
    if (p.current) return false; // Exclude current plan from "browse"
    const matchesCategory = category === "all" || (p.categories || []).includes(category);
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.speed.toLowerCase().includes(q) || (p.ott || "").toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const humanDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="pb-6">
      <ScreenHeader title="My Plans" onBack={goBack} />
      <div className="px-5">
        {/* Current plan card */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>YOUR CURRENT PLAN</p>
        <Card style={{ border: `1.5px solid ${BLUE}` }} className="mb-5">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E7EEFE" }}><Wifi size={16} color={BLUE} /></div>
              <div>
                <p className="text-[15px] font-bold" style={{ color: NAVY }}>{bb.plan}</p>
                <p className="text-[12px] font-semibold" style={{ color: MUTED }}>200 Mbps · 1 Month validity</p>
              </div>
            </div>
            <span className="text-[15px] font-bold" style={{ color: NAVY }}>₹{bb.price}</span>
          </div>
          <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid #F1F4F9" }}>
            <Clock size={14} color={MUTED} />
            <span className="text-[12px] font-semibold" style={{ color: MUTED }}>Renews {humanDate(bb.expiry)} · {bb.daysLeft} days left</span>
          </div>
        </Card>

        {/* OTT subscriptions */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>OTT SUBSCRIPTIONS</p>
        <Card style={{ padding: 0 }} className="overflow-hidden mb-5">
          <div className="px-4 py-3" style={{ borderBottom: "1px solid #F1F4F9", background: SURFACE }}>
            <p className="text-[12px] font-semibold" style={{ color: MUTED }}>Bundled with Cityline TV Gold</p>
          </div>
          {[
            { name: "ZEE5 Premium", status: "active" },
            { name: "SonyLIV", status: "active" },
            { name: "Discovery+", status: "failed", reason: "Activation email bounced" },
          ].map((ott) => (
            <div key={ott.name} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #F1F4F9" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ott.status === "active" ? "#EAF7EF" : "#FEEBEC" }}>
                  <Tv size={16} color={ott.status === "active" ? "#16A34A" : "#DC2626"} />
                </div>
                <p className="text-[13px] font-semibold" style={{ color: NAVY }}>{ott.name}</p>
              </div>
              {ott.status === "active" ? (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full" style={{ background: "#EAF7EF", color: "#16A34A" }}>
                  <CheckCircle2 size={12} /> Active
                </span>
              ) : (
                <button onClick={() => setRetryOpen(ott)} className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full" style={{ background: "#FEEBEC", color: "#DC2626" }}>
                  <RefreshCw size={12} /> Retry
                </button>
              )}
            </div>
          ))}
        </Card>

        {/* Browse other plans */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>BROWSE OTHER PLANS</p>

        {/* Search + filter */}
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2.5 mb-3">
          <Search size={16} color="#94A3B8" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plans, speed, OTT..."
            className="flex-1 outline-none text-[13px] font-semibold bg-transparent" style={{ color: NAVY }} />
        </div>
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {PLAN_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold"
                style={{
                  background: active ? NAVY : "#fff",
                  color: active ? "#fff" : NAVY,
                  border: active ? "1.5px solid " + NAVY : "1.5px solid #E2E8F0",
                }}>
                {c.label}
              </button>
            );
          })}
        </div>

        {filteredPlans.length === 0 ? (
          <Card className="text-center py-8">
            <Search size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No plans match your filter</p>
            <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Try a different search or category</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredPlans.map((p) => (
              <Card key={p.id}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E7EEFE" }}><Wifi size={16} color={BLUE} /></div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold" style={{ color: NAVY }}>{p.name} · {p.tenure}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: MUTED }}>
                          <Zap size={12} color={BLUE} /> {p.speed}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: MUTED }}>
                          <Tv size={12} color="#16A34A" /> {p.ott}
                        </span>
                      </div>
                      {p.savings && <p className="text-[12px] font-bold text-[#16A34A] mt-1">{p.savings}</p>}
                    </div>
                  </div>
                  <span className="text-[13px] font-bold shrink-0" style={{ color: NAVY }}>₹{p.price.toLocaleString("en-IN")}</span>
                </div>
                <button onClick={() => setRequestOpen(p)}
                  className="mt-3 w-full text-center text-[12px] font-bold py-2.5 rounded-xl"
                  style={{ background: "transparent", color: ORANGE, border: `1.5px solid ${ORANGE}` }}>
                  Request Change
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request change modal */}
      {requestOpen && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setRequestOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-1">Request plan change</h3>
            <p className="text-[13px] font-semibold mb-4" style={{ color: MUTED }}>Our team will confirm within 24 hours and pro-rate your billing.</p>
            <Card className="mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[13px] font-bold" style={{ color: NAVY }}>{requestOpen.name}</p>
                  <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{requestOpen.speed} · {requestOpen.tenure}</p>
                </div>
                <span className="text-[15px] font-bold" style={{ color: NAVY }}>₹{requestOpen.price}</span>
              </div>
            </Card>
            <PrimaryButton full tone="orange" onClick={() => setRequestOpen(null)}>Confirm request</PrimaryButton>
            <button onClick={() => setRequestOpen(null)} className="w-full text-center text-[13px] font-semibold mt-3 py-2" style={{ color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Retry OTT modal */}
      {retryOpen && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setRetryOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <AlertTriangle size={32} color="#D97706" className="mx-auto mb-3" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold text-center mb-1">{retryOpen.name} activation failed</h3>
            <p className="text-[13px] font-semibold text-center mb-5" style={{ color: MUTED }}>{retryOpen.reason}. We'll retry activation now.</p>
            <PrimaryButton full tone="orange" onClick={() => setRetryOpen(null)}>Retry activation</PrimaryButton>
            <button onClick={() => setRetryOpen(null)} className="w-full text-center text-[13px] font-semibold mt-3 py-2" style={{ color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RechargeScreen({ goto, goBack }) {
  const bb = SERVICES.find((s) => s.id === "bb");
  const [showPay, setShowPay] = useState(false);

  return (
    <div className="pb-6">
      <ScreenHeader title="Recharge & Payments" onBack={goBack} />
      <div className="px-5">
        {/* Current plan hero */}
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full" style={{ background: "#E7EEFE" }} />
          <div className="flex justify-between items-center relative">
            <div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: "#E7EEFE" }}><Wifi size={16} color={BLUE} /></div>
              <p className="text-[#64748B] text-[12px] font-semibold">Current plan</p>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mt-0.5">{bb.plan}</h3>
              <p className="text-[#64748B] text-[12px] font-semibold mt-1">Expires {bb.expiry}</p>
            </div>
            <FiberDial percent={68} label={`${bb.daysLeft}`} sub="days left" color={BLUE} track="#EAF0FB" />
          </div>
          <button onClick={() => setShowPay(true)} className="mt-4 w-full rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold text-[13px] relative" style={{ background: ORANGE, color: "#fff" }}>
            Recharge {bb.plan} — ₹{bb.price}
          </button>
        </div>

        {/* Pay & recharge tiles */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>PAY & RECHARGE</p>
        <Card className="mb-5">
          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
            {[
              { icon: Zap, label: "Pay bill", action: () => setShowPay(true) },
              { icon: PlusCircle, label: "Add-ons", action: () => goto("addons") },
              { icon: RefreshCw, label: "Auto-pay", action: () => goto("autoRecharge") },
              { icon: Sparkles, label: "My plans", action: () => goto("plans") },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.label} onClick={t.action} className="flex flex-col items-center gap-2 py-1">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#E7EEFE" }}>
                    <Icon size={18} color={BLUE} />
                  </div>
                  <span className="font-semibold text-center leading-tight" style={{ color: NAVY, fontSize: "11px" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* History & records tiles */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>HISTORY & RECORDS</p>
        <Card className="mb-5">
          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
            {[
              { icon: Clock, label: "History", action: () => goto("paymentHistory") },
              { icon: FileText, label: "Statements", action: () => goto("billsStatement") },
              { icon: Download, label: "Invoices", action: () => goto("invoiceHistory") },
              { icon: BarChart3, label: "My usage", action: () => goto("dataUsage") },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.label} onClick={t.action} className="flex flex-col items-center gap-2 py-1">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#E7EEFE" }}>
                    <Icon size={18} color={BLUE} />
                  </div>
                  <span className="font-semibold text-center leading-tight" style={{ color: NAVY, fontSize: "11px" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Recent payments */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold" style={{ color: NAVY }}>Recent payments <span className="font-semibold" style={{ color: MUTED }}>({Math.min(3, INVOICES.length)} of {INVOICES.length})</span></p>
          <button onClick={() => goto("paymentHistory")} style={{ color: ORANGE }} className="text-[12px] font-bold flex items-center gap-0.5">View all <ChevronRight size={12} /></button>
        </div>
        <div className="flex flex-col gap-2.5">
          {INVOICES.slice(0, 3).map((inv) => (
            <Card key={inv.id} onClick={() => goto("receipt", inv)} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EAF7EF" }}><CheckCircle2 size={16} color="#16A34A" /></div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: NAVY }}>{inv.id}</p>
                  <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{inv.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold" style={{ color: NAVY }}>₹{inv.amount}</span>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {showPay && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowPay(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <p className="text-[12px] font-semibold mb-1" style={{ color: MUTED }}>Amount payable (full amount only)</p>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[28px] font-bold mb-5">₹{bb.price}.00</h3>
            <div className="flex items-center gap-3 border border-[#E2E8F0] rounded-2xl p-3.5 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: SURFACE }}><CreditCard size={16} color={NAVY} /></div>
              <span className="text-[13px] font-semibold flex-1" style={{ color: NAVY }}>UPI / Cards / Netbanking</span>
              <span className="text-[12px] font-semibold" style={{ color: BLUE }}>via Razorpay</span>
            </div>
            <PrimaryButton full tone="orange" onClick={() => { setShowPay(false); goto("receipt", { id: `INV-2026-071${Math.floor(Math.random()*9)}`, date: "2026-07-07", amount: bb.price, status: "paid", fresh: true }); }}>
              Pay ₹{bb.price}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptScreen({ goto, goBack, invoice }) {
  return (
    <div className="h-full flex flex-col">
      <div style={{ background: NAVY }} className="rounded-b-[32px] pb-8">
        <ScreenHeader title="Receipt" onBack={goBack} dark right={
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}><Share2 size={16} color="#fff" /></button>
        } />
        <div className="flex flex-col items-center mt-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.15)" }}>
            <CheckCircle2 size={32} color="#fff" />
          </div>
          <p className="text-[#B9C7E6] text-[12px]">{invoice.fresh ? "Payment successful" : "Amount paid"}</p>
          <h2 style={{ fontFamily: "'Poppins', sans-serif" }} className="text-white text-[28px] font-bold mt-1">₹{invoice.amount.toLocaleString("en-IN")}</h2>
        </div>
      </div>

      <div className="flex-1 px-5 -mt-5">
        <Card>
          <div className="flex flex-col gap-3">
            {[
              ["Transaction ID", invoice.id],
              ["Date", invoice.date],
              ["Service", "Broadband — Sonic 200"],
              ["Payment method", "UPI via Razorpay"],
              ["Status", null],
            ].map(([k, v], i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[13px] text-[#64748B]">{k}</span>
                {v ? <span className="text-[13px] font-semibold" style={{ color: NAVY }}>{v}</span> : <StatusPill status="active" />}
              </div>
            ))}
            <div className="border-t border-dashed border-[#E2E8F0] my-1" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold" style={{ color: NAVY }}>Total paid</span>
              <span className="text-[15px] font-bold" style={{ color: NAVY }}>₹{invoice.amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <PrimaryButton tone="outline" icon={Download}>Download</PrimaryButton>
          <PrimaryButton tone="dark" icon={Share2}>Share</PrimaryButton>
        </div>
      </div>
      <div className="px-5 pb-6">
        <PrimaryButton full tone="blue" onClick={() => goto("home")}>Back to Home</PrimaryButton>
      </div>
    </div>
  );
}

function SupportScreen({ goto, goBack, tickets }) {
  return (
    <div className="pb-6">
      <ScreenHeader title="Support" onBack={goBack} />
      <div className="px-5">
        {/* Hero */}
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EAF7EF 0%, #D1F0DC 100%)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#fff" }}>
            <Headset size={18} color="#16A34A" />
          </div>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold">We're here to help</p>
          <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Self-diagnose or reach us however you prefer.</p>
        </div>

        {/* Self-service tiles */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>SELF-SERVICE</p>
        <Card className="mb-5">
          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
            {[
              { icon: Gauge, label: "Diagnostics", action: () => goto("diagnostics") },
              { icon: AlertTriangle, label: "Troubleshoot", action: () => goto("troubleshoot") },
              { icon: Sparkles, label: "Tips", action: () => goto("helpfulTips") },
              { icon: FileText, label: "FAQs", action: () => goto("faqs") },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.label} onClick={t.action} className="flex flex-col items-center gap-2 py-1">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#E7EEFE" }}>
                    <Icon size={18} color={BLUE} />
                  </div>
                  <span className="font-semibold text-center leading-tight" style={{ color: NAVY, fontSize: "11px" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Get in touch tiles */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>GET IN TOUCH</p>
          <span className="flex items-center gap-1 text-[10.5px] font-bold" style={{ color: "#16A34A" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16A34A" }} /> Agents online
          </span>
        </div>
        <Card className="mb-5">
          <div className="grid grid-cols-3 gap-y-4 gap-x-2">
            {[
              { icon: Headset, label: "New ticket", action: () => goto("newticket") },
              { icon: Send, label: "Live chat", online: true, action: () => goto("liveChat") },
              { icon: Phone, label: "Call us", action: () => goto("callUs") },
              { icon: CheckCircle2, label: "WhatsApp", action: () => goto("whatsapp") },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.label} onClick={t.action} className="flex flex-col items-center gap-2 py-1">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#E7EEFE" }}>
                      <Icon size={18} color={BLUE} />
                    </div>
                    {t.online && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#16A34A" }} />}
                  </div>
                  <span className="font-semibold text-center leading-tight" style={{ color: NAVY, fontSize: "11px" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tickets list */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold" style={{ color: NAVY }}>Your tickets</p>
          <button onClick={() => goto("newticket")} className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-xl" style={{ background: ORANGE, color: "#fff" }}>
            <PlusCircle size={16} /> New
          </button>
        </div>
        {tickets.length === 0 ? (
          <Card className="text-center py-8">
            <Headset size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No tickets yet</p>
            <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Facing an issue? Raise a ticket and we'll help.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tickets.map((t) => (
              <Card key={t.id} onClick={() => goto("ticketDetail", t)}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: NAVY }}>{t.category}</p>
                    <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{t.id} · {t.service} · {new Date(t.created).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</p>
                  </div>
                  <StatusPill status={t.status === "Resolved" ? "active" : "pending"} />
                </div>
                {t.desc && <p className="text-[12px] font-semibold mt-2 pt-2 line-clamp-2" style={{ color: NAVY, borderTop: "1px solid #F1F4F9" }}>{t.desc}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewTicketScreen({ goto, goBack, onSubmit }) {
  const [service, setService] = useState(null);
  const [category, setCategory] = useState(null);
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState(false);
  const [step, setStep] = useState(1);

  if (step === 4) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EAF7EF" }}><CheckCircle2 size={32} color="#16A34A" /></div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-2">Ticket raised</h2>
        <p className="text-[13px] text-[#64748B] mb-6">We've logged your issue and assigned it to our team. You'll get updates via notification.</p>
        <PrimaryButton full tone="blue" onClick={() => { onSubmit({ service, category, desc }); goto("support"); }}>Back to Support</PrimaryButton>
      </div>
    );
  }
  return (
    <div className="pb-6">
      <ScreenHeader title="Raise a Ticket" onBack={() => step === 1 ? goBack() : setStep(step - 1)} />
      <div className="px-5">
        {step === 1 && (
          <>
            <p className="text-[13px] font-bold mb-3" style={{ color: NAVY }}>Which service is affected?</p>
            <div className="flex flex-col gap-2.5 mb-6">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setService(s.type)}>
                    <Card style={service === s.type ? { border: `1.5px solid ${BLUE}` } : {}} className="flex items-center gap-3">
                      <Icon size={18} color={NAVY} />
                      <span className="text-[13px] font-semibold" style={{ color: NAVY }}>{s.type}</span>
                      {service === s.type && <CheckCircle2 size={16} color={BLUE} className="ml-auto" />}
                    </Card>
                  </button>
                );
              })}
            </div>
            <PrimaryButton full tone="blue" disabled={!service} onClick={() => setStep(2)}>Continue</PrimaryButton>
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-[13px] font-bold mb-3" style={{ color: NAVY }}>What's the issue?</p>
            <div className="flex flex-col gap-2.5 mb-6">
              {TICKET_CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}>
                  <Card style={category === c ? { border: `1.5px solid ${BLUE}` } : {}} className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold" style={{ color: NAVY }}>{c}</span>
                    {category === c && <CheckCircle2 size={16} color={BLUE} />}
                  </Card>
                </button>
              ))}
            </div>
            <PrimaryButton full tone="blue" disabled={!category} onClick={() => setStep(3)}>Continue</PrimaryButton>
          </>
        )}
        {step === 3 && (
          <>
            <p className="text-[13px] font-bold mb-3" style={{ color: NAVY }}>Describe the issue</p>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Tell us more about what's happening..." rows={5}
              className="w-full border border-[#E2E8F0] rounded-2xl p-3.5 text-[13px] outline-none focus:border-blue-500 mb-4 resize-none" style={{ color: NAVY }} />
            <button onClick={() => setPhoto(!photo)} className="w-full mb-6">
              <Card className="flex items-center justify-center gap-2" style={{ border: "1.5px dashed #CBD5E1" }}>
                <Camera size={16} color={photo ? BLUE : "#94A3B8"} />
                <span className="text-[13px] font-semibold" style={{ color: photo ? BLUE : "#94A3B8" }}>{photo ? "1 photo attached" : "Attach a photo (optional)"}</span>
              </Card>
            </button>
            <PrimaryButton full tone="blue" disabled={!desc} onClick={() => setStep(4)}>Submit Ticket</PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

function TicketDetailScreen({ goto, goBack, data }) {
  const ticket = data?.ticket || data;
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [closing, setClosing] = useState(false);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);

  const submitOtp = () => {
    if (otp === "1234" || otp.length === 4) { setClosing(true); setOtpError(false); }
    else { setOtpError(true); }
  };
  const humanDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

  return (
    <div className="pb-6">
      <ScreenHeader title={ticket.id} onBack={goBack} />
      <div className="px-5">
        <Card className="mb-5">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[15px] font-bold" style={{ color: NAVY }}>{ticket.category}</h3>
            <StatusPill status={ticket.status === "Resolved" ? "active" : "pending"} />
          </div>
          <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{ticket.service} · Raised {humanDate(ticket.created)}</p>
          {ticket.status === "Resolved" && ticket.closed && (
            <div className="mt-2 pt-2 flex items-center gap-1.5" style={{ borderTop: "1px solid #F1F4F9" }}>
              <CheckCircle2 size={14} color="#16A34A" />
              <span className="text-[12px] font-semibold" style={{ color: "#16A34A" }}>Closed on {humanDate(ticket.closed)}</span>
            </div>
          )}
          {ticket.desc && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #F1F4F9" }}>
              <p className="text-[10.5px] font-bold tracking-wide mb-1" style={{ color: MUTED_LABEL }}>YOUR REPORT</p>
              <p className="text-[13px] font-semibold" style={{ color: NAVY }}>{ticket.desc}</p>
            </div>
          )}
        </Card>

        <p className="text-[13px] font-bold mb-3" style={{ color: NAVY }}>Status timeline</p>
        <div className="flex flex-col gap-0 mb-6">
          {ticket.timeline.map((t, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: t.done ? BLUE : "#E2E8F0" }}>
                  {t.done && <CheckCircle2 size={16} color="#fff" />}
                </div>
                {i < ticket.timeline.length - 1 && <div className="w-0.5 flex-1" style={{ background: t.done ? BLUE : "#E2E8F0", minHeight: 28 }} />}
              </div>
              <div className="pb-6">
                <p className="text-[13px] font-semibold" style={{ color: t.done ? NAVY : "#94A3B8" }}>{t.label}</p>
                {t.time && <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{t.time}</p>}
              </div>
            </div>
          ))}
        </div>

        {ticket.status !== "Resolved" && (
          <>
            {/* Follow-up comment */}
            <Card className="mb-4">
              <p className="text-[13px] font-bold mb-1" style={{ color: NAVY }}>Add a follow-up comment</p>
              <p className="text-[12px] font-semibold mb-3" style={{ color: MUTED }}>Add extra details or context for the engineer.</p>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Type your comment..."
                className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-[13px] font-semibold outline-none focus:border-blue-500 resize-none mb-3" style={{ color: NAVY }} />
              <PrimaryButton full tone="outline" disabled={!comment} onClick={() => { setCommentSent(true); setComment(""); setTimeout(() => setCommentSent(false), 2000); }}>Post comment</PrimaryButton>
              {commentSent && <p className="text-[12px] font-semibold text-center mt-3" style={{ color: "#16A34A" }}>✓ Comment added to ticket</p>}
            </Card>

            {/* OTP resolution */}
            <Card>
              <p className="text-[13px] font-bold mb-1" style={{ color: NAVY }}>Confirm resolution</p>
              <p className="text-[12px] font-semibold mb-3" style={{ color: MUTED }}>If our engineer says this is fixed, enter the OTP they share to close this ticket.</p>
              <input value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 4)); setOtpError(false); }} placeholder="Enter 4-digit OTP"
                className="w-full bg-white border rounded-xl px-3.5 py-2.5 text-[13px] font-semibold outline-none mb-1"
                style={{ color: NAVY, borderColor: otpError ? "#DC2626" : "#E2E8F0" }} />
              {otpError && <p className="text-[12px] font-semibold mb-3" style={{ color: "#DC2626" }}>Incorrect OTP. Try again or ask engineer to re-send.</p>}
              <div className="mt-3">
                <PrimaryButton full tone="outline" disabled={otp.length !== 4} onClick={submitOtp}>Confirm & Close Ticket</PrimaryButton>
              </div>
              {closing && <p className="text-[12px] font-semibold text-center mt-3" style={{ color: "#16A34A" }}>Ticket closed. Thanks for confirming!</p>}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function SpeedTestScreen({ goto, goBack }) {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const run = () => { setState("testing"); setTimeout(() => { setResult({ down: 187, up: 92, ping: 11 }); setState("done"); }, 2600); };
  return (
    <div className="pb-6 h-full flex flex-col">
      <ScreenHeader title="Speed Test" onBack={goBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative flex items-center justify-center mb-8" style={{ width: 180, height: 180 }}>
          {state === "testing" && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#2F6FED30" }} />}
          <div className="w-40 h-40 rounded-full flex flex-col items-center justify-center" style={{ background: GRADIENT }}>
            {state !== "done" ? (
              <>
                <Gauge size={30} color="#fff" className={state === "testing" ? "animate-pulse" : ""} />
                <span className="text-white text-[12px] mt-2">{state === "testing" ? "Testing..." : "Tap to start"}</span>
              </>
            ) : (
              <>
                <span style={{ fontFamily: "'Poppins', sans-serif" }} className="text-white text-[28px] font-bold">{result.down}</span>
                <span className="text-white/70 text-[12px]">Mbps down</span>
              </>
            )}
          </div>
        </div>
        {state !== "done" ? (
          <PrimaryButton full tone="orange" onClick={run} disabled={state === "testing"}>{state === "testing" ? "Running..." : "Start Test"}</PrimaryButton>
        ) : (
          <div className="w-full grid grid-cols-2 gap-3">
            <Card className="text-center"><p className="text-[19px] font-bold" style={{ color: NAVY }}>{result.up}</p><p className="text-[12px] text-[#64748B]">Mbps up</p></Card>
            <Card className="text-center"><p className="text-[19px] font-bold" style={{ color: NAVY }}>{result.ping} ms</p><p className="text-[12px] text-[#64748B]">Ping</p></Card>
          </div>
        )}
        {state === "done" && (
          <p className="text-[12px] text-[#64748B] text-center mt-5">Getting less than <b>150 Mbps</b> on your Sonic 200 plan? <button onClick={() => goto("newticket")} style={{ color: ORANGE }} className="font-semibold">Raise a ticket</button></p>
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ goto, goBack }) {
  const [lock, setLock] = useState(true);
  const [lang, setLang] = useState("English");
  const [notifs, setNotifs] = useState(true);
  const [showTerm, setShowTerm] = useState(false);
  const [showKyc, setShowKyc] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const homeAccount = ACCOUNTS[0];

  const Row = ({ icon: Icon, label, value, onClick, danger }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #F1F4F9" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: danger ? "#FEEBEC" : SURFACE }}>
          <Icon size={16} color={danger ? "#DC2626" : NAVY} />
        </div>
        <span className="text-[13px] font-semibold" style={{ color: danger ? "#DC2626" : NAVY }}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {value && <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{value}</span>}
        <ChevronRight size={16} color="#94A3B8" />
      </div>
    </button>
  );

  const ToggleRow = ({ icon: Icon, label, value, onChange }) => (
    <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #F1F4F9" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: SURFACE }}><Icon size={16} color={NAVY} /></div>
        <span className="text-[13px] font-semibold" style={{ color: NAVY }}>{label}</span>
      </div>
      <button onClick={() => onChange(!value)} className="w-11 h-6 rounded-full flex items-center px-0.5 shrink-0" style={{ background: value ? BLUE : "#E2E8F0" }}>
        <div className="w-5 h-5 rounded-full bg-white" style={{ transform: value ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s" }} />
      </button>
    </div>
  );

  const SectionLabel = ({ children }) => (
    <p className="text-[10.5px] font-bold tracking-wide mb-2 mt-5 px-1" style={{ color: MUTED_LABEL }}>{children}</p>
  );

  return (
    <div className="pb-6">
      <ScreenHeader title="Profile" onBack={goBack} />
      <div className="px-5">
        {/* Profile card */}
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full" style={{ background: "#E7EEFE" }} />
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[19px] relative shrink-0" style={{ background: NAVY, color: "#fff" }}>RM</div>
          <div className="relative flex-1 min-w-0">
            <p className="text-[15px] font-bold" style={{ color: NAVY }}>{CUSTOMER.name}</p>
            <p className="text-[12px] font-semibold truncate" style={{ color: MUTED }}>{CUSTOMER.phone} · {CUSTOMER.customerId}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EAF7EF", color: "#16A34A" }}><ShieldCheck size={12} /> KYC {CUSTOMER.kyc}</span>
          </div>
        </div>

        {/* MY WIFI section (moved from Home) */}
        <SectionLabel>MY WIFI</SectionLabel>
        <Card>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: SlidersHorizontal, label: "Settings", action: () => goto("wifiSettings") },
              { icon: Wifi, label: "Devices", action: () => goto("devices") },
              { icon: Router, label: "Details", action: () => goto("deviceDetails") },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.label} onClick={t.action} className="flex flex-col items-center gap-2 py-2">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#E7EEFE" }}>
                    <Icon size={18} color={BLUE} />
                  </div>
                  <span className="font-semibold text-center" style={{ color: NAVY, fontSize: "11px" }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <SectionLabel>MY ACCOUNT</SectionLabel>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          <Row icon={User} label="Personal info" value={CUSTOMER.name.split(" ")[0]} onClick={() => {}} />
          <Row icon={FileText} label="KYC documents" value={CUSTOMER.kyc} onClick={() => setShowKyc(true)} />
          <Row icon={MapPin} label="Service address" onClick={() => setShowAddress(true)} />
          <Row icon={Wifi} label="Linked accounts" value={`${ACCOUNTS.length} linked`} onClick={() => goto("linkAccount")} />
        </Card>

        <SectionLabel>SERVICE REQUESTS</SectionLabel>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          <Row icon={Clock} label="Track service request" onClick={() => goto("trackServiceRequest")} />
          <Row icon={MapPin} label="Relocate connection" onClick={() => goto("relocate")} />
          <Row icon={FileText} label="Track new order" onClick={() => goto("trackOrder")} />
          <Row icon={RefreshCw} label="Ownership transfer" onClick={() => goto("ownershipTransfer")} />
          <Row icon={XCircle} label="Track cancellation" onClick={() => goto("trackCancellation")} />
        </Card>

        <SectionLabel>PREFERENCES</SectionLabel>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          <ToggleRow icon={Fingerprint} label="Biometric app lock" value={lock} onChange={setLock} />
          <ToggleRow icon={Bell} label="Push notifications" value={notifs} onChange={setNotifs} />
          <Row icon={Globe} label="App language" value={lang} onClick={() => setShowLang(true)} />
        </Card>

        <SectionLabel>LEGAL & SUPPORT</SectionLabel>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          <Row icon={FileText} label="Privacy policy" onClick={() => {}} />
          <Row icon={FileText} label="Terms of service" onClick={() => {}} />
          <Row icon={FileText} label="About Cityline" onClick={() => setShowAbout(true)} />
        </Card>

        <SectionLabel>ACCOUNT ACTIONS</SectionLabel>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          <Row icon={XCircle} label="Request termination" onClick={() => setShowTerm(true)} danger />
          <Row icon={LogOut} label="Log out" onClick={() => setShowLogout(true)} danger />
        </Card>
      </div>

      {showTerm && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowTerm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <AlertTriangle size={36} color="#D97706" className="mx-auto mb-3" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold text-center mb-1">Sorry to see you go</h3>
            <p className="text-[13px] font-semibold text-center mb-5" style={{ color: MUTED }}>A member of our retention team will call you within 24 hours before any action is taken on your account.</p>
            <PrimaryButton full tone="dark" onClick={() => setShowTerm(false)}>Confirm Termination Request</PrimaryButton>
            <button onClick={() => setShowTerm(false)} className="w-full text-center text-[13px] font-semibold mt-3 py-2" style={{ color: MUTED }}>Keep my connection</button>
          </div>
        </div>
      )}

      {/* KYC documents sheet */}
      {showKyc && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowKyc(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-1">KYC documents</h3>
            <p className="text-[13px] font-semibold mb-4" style={{ color: MUTED }}>Documents verified with Cityline via Digio.</p>
            <div className="flex flex-col gap-2.5">
              {[
                { name: "Aadhaar Card", value: "XXXX-XXXX-4451", status: "Verified" },
                { name: "PAN Card", value: "ABCDE1234F", status: "Verified" },
                { name: "Address Proof", value: "Electricity bill", status: "Verified" },
              ].map((d) => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: SURFACE }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EAF7EF" }}><FileText size={16} color="#16A34A" /></div>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: NAVY }}>{d.name}</p>
                      <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{d.value}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-1 rounded-full" style={{ background: "#EAF7EF", color: "#16A34A" }}><CheckCircle2 size={12} /> {d.status}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowKyc(false)} className="w-full text-center text-[13px] font-bold mt-4 py-2" style={{ color: MUTED }}>Close</button>
          </div>
        </div>
      )}

      {/* Service address sheet */}
      {showAddress && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowAddress(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-1">Service address</h3>
            <p className="text-[13px] font-semibold mb-4" style={{ color: MUTED }}>Where your Cityline service is installed.</p>
            <Card>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E7EEFE" }}><MapPin size={16} color={BLUE} /></div>
                <p className="text-[13px] font-semibold leading-relaxed" style={{ color: NAVY }}>{homeAccount.address}</p>
              </div>
            </Card>
            <PrimaryButton full tone="outline" onClick={() => { setShowAddress(false); goto("relocate"); }}>Relocate connection</PrimaryButton>
            <button onClick={() => setShowAddress(false)} className="w-full text-center text-[13px] font-bold mt-3 py-2" style={{ color: MUTED }}>Close</button>
          </div>
        </div>
      )}

      {/* App language sheet */}
      {showLang && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowLang(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-1">App language</h3>
            <p className="text-[13px] font-semibold mb-4" style={{ color: MUTED }}>Choose your preferred language.</p>
            <div className="flex flex-col gap-2">
              {["English", "हिंदी", "मराठी", "தமிழ்", "తెలుగు"].map((l) => (
                <button key={l} onClick={() => { setLang(l); setShowLang(false); }}
                  className="flex items-center justify-between p-3.5 rounded-2xl"
                  style={{ background: lang === l ? "#E7EEFE" : SURFACE, border: lang === l ? `1.5px solid ${BLUE}` : "1.5px solid transparent" }}>
                  <span className="text-[13px] font-bold" style={{ color: NAVY }}>{l}</span>
                  {lang === l && <CheckCircle2 size={16} color={BLUE} />}
                </button>
              ))}
            </div>
            <button onClick={() => setShowLang(false)} className="w-full text-center text-[13px] font-bold mt-4 py-2" style={{ color: MUTED }}>Close</button>
          </div>
        </div>
      )}

      {/* Log out confirmation */}
      {showLogout && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowLogout(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <LogOut size={32} color="#DC2626" className="mx-auto mb-3" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold text-center mb-1">Log out?</h3>
            <p className="text-[13px] font-semibold text-center mb-5" style={{ color: MUTED }}>You'll need to log in again with your mobile number and OTP.</p>
            <PrimaryButton full tone="dark" onClick={() => { setShowLogout(false); goto("login"); }}>Log out</PrimaryButton>
            <button onClick={() => setShowLogout(false)} className="w-full text-center text-[13px] font-bold mt-3 py-2" style={{ color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}

      {/* About Cityline sheet */}
      {showAbout && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setShowAbout(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-3">
              <CitylineMark size={40} />
              <div>
                <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold">Cityline Networks</h3>
                <p className="text-[12px] font-semibold" style={{ color: MUTED }}>Version 2.1.0 · Build 240824</p>
              </div>
            </div>
            <p className="text-[13px] font-semibold leading-relaxed mb-4" style={{ color: NAVY }}>Cityline Networks is a Mumbai-based fiber ISP serving homes and businesses across Maharashtra since 2018.</p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: MUTED }}>
                <Globe size={14} /> www.cityline.in
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: MUTED }}>
                <Phone size={14} /> 1800-266-1234
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: MUTED }}>
                <MapPin size={14} /> Andheri East, Mumbai
              </div>
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full text-center text-[13px] font-bold py-2" style={{ color: MUTED }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsScreen({ goto, goBack }) {
  const iconFor = (type) => {
    if (type === "payment") return { icon: CreditCard, bg: "#E7EEFE", fg: BLUE };
    if (type === "ticket") return { icon: Headset, bg: "#FDF0E7", fg: ORANGE };
    if (type === "outage") return { icon: AlertTriangle, bg: "#FEF3E2", fg: "#D97706" };
    return { icon: Sparkles, bg: "#EAF7EF", fg: "#16A34A" };
  };
  return (
    <div className="pb-6">
      <ScreenHeader title="Notifications" onBack={goBack} />
      <div className="px-5 flex flex-col gap-2.5">
        {NOTIFICATIONS.map((n) => {
          const { icon: Icon, bg, fg } = iconFor(n.type);
          return (
            <Card key={n.id} className="flex items-start gap-3" style={n.unread ? { border: "1px solid #E7EEFE" } : {}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon size={16} color={fg} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold" style={{ color: NAVY }}>{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: ORANGE }} />}
                </div>
                <p className="text-[12px] font-semibold mt-0.5 leading-snug" style={{ color: MUTED }}>{n.body}</p>
                <p className="text-[10.5px] font-semibold mt-1.5" style={{ color: MUTED_LABEL }}>{n.time}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LandlineReportScreen({ goto, goBack }) {
  const [issue, setIssue] = useState(null);
  const [desc, setDesc] = useState("");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const issues = [
    { id: "no-dial", label: "No dial tone", icon: Phone, desc: "Handset picks up but no sound" },
    { id: "no-incoming", label: "Not receiving calls", icon: PhoneMissed, desc: "Callers say phone is ringing but you don't hear it" },
    { id: "no-outgoing", label: "Can't make calls", icon: PhoneOff, desc: "Dial tone works but outgoing calls fail" },
    { id: "noise", label: "Poor call quality", icon: Volume2, desc: "Echo, static, or crackling on the line" },
    { id: "other", label: "Something else", icon: MessageCircle, desc: "Any other landline issue" },
  ];

  if (submitted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EAF7EF" }}><CheckCircle2 size={32} color="#16A34A" /></div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-2">Issue reported</h2>
        <p className="text-[13px] font-semibold mb-6" style={{ color: MUTED }}>An engineer will contact you within 4 hours. Track progress in the Support tab.</p>
        <PrimaryButton full tone="blue" onClick={() => goto("support")}>Go to Support</PrimaryButton>
        <button onClick={() => goto("home")} className="w-full text-center text-[13px] font-bold mt-3 py-2" style={{ color: MUTED }}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Report landline issue" onBack={() => step === 1 ? goBack() : setStep(1)} />
      <div className="px-5">
        {step === 1 && (
          <>
            <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>STEP 1 OF 2</p>
            <p className="text-[13px] font-bold mb-1" style={{ color: NAVY }}>What's the issue?</p>
            <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Pick the closest match. Our engineer will call you back.</p>
            <div className="flex flex-col gap-2.5">
              {issues.map((it) => {
                const Icon = it.icon;
                const active = issue?.id === it.id;
                return (
                  <button key={it.id} onClick={() => setIssue(it)} className="w-full">
                    <Card style={active ? { border: `1.5px solid ${BLUE}` } : {}}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: active ? "#E7EEFE" : SURFACE }}>
                          <Icon size={16} color={active ? BLUE : NAVY} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[13px] font-bold" style={{ color: NAVY }}>{it.label}</p>
                          <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{it.desc}</p>
                        </div>
                        {active && <CheckCircle2 size={16} color={BLUE} />}
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
            <div className="mt-6">
              <PrimaryButton full tone="orange" disabled={!issue} onClick={() => setStep(2)}>Continue</PrimaryButton>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>STEP 2 OF 2</p>
            <p className="text-[13px] font-bold mb-1" style={{ color: NAVY }}>Tell us more</p>
            <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Any extra details help our engineer diagnose faster.</p>
            <Card className="mb-4">
              <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>SELECTED ISSUE</p>
              <p className="text-[13px] font-bold mt-1" style={{ color: NAVY }}>{issue.label}</p>
            </Card>
            <label className="text-[10.5px] font-bold tracking-wide mb-2 block px-1" style={{ color: MUTED_LABEL }}>DESCRIPTION (OPTIONAL)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="When did this start? Have you tried restarting the router?"
              className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-3.5 text-[13px] font-semibold outline-none focus:border-blue-500 resize-none mb-6" style={{ color: NAVY }} />
            <PrimaryButton full tone="orange" onClick={() => setSubmitted(true)}>Submit report</PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

function AddOttScreen({ goto, goBack }) {
  const [added, setAdded] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(null);

  const ottApps = [
    { id: "netflix", name: "Netflix", desc: "Movies, series, originals", price: 649, tag: "Most popular" },
    { id: "prime", name: "Amazon Prime Video", desc: "Movies + free shipping benefits", price: 299, tag: null },
    { id: "hotstar", name: "Disney+ Hotstar", desc: "Live sports, Disney, HBO", price: 499, tag: null },
    { id: "jiocinema", name: "JioCinema Premium", desc: "IPL, Warner Bros, HBO originals", price: 199, tag: "Best value" },
    { id: "hoichoi", name: "Hoichoi", desc: "Bengali movies and originals", price: 149, tag: null },
    { id: "altbalaji", name: "ALTBalaji", desc: "Hindi originals and shows", price: 99, tag: null },
  ];

  return (
    <div className="pb-6">
      <ScreenHeader title="Add more OTT" onBack={goBack} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EAF7EF 0%, #D1F0DC 100%)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#fff" }}><Tv size={18} color="#16A34A" /></div>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">Boost your OTT bundle</p>
          <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Charged monthly with your Cityline bill.</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {ottApps.map((app) => {
            const isAdded = added[app.id];
            return (
              <Card key={app.id}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#F1F4F9" }}><Tv size={18} color={NAVY} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-bold" style={{ color: NAVY }}>{app.name}</p>
                        {app.tag && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FDF0E7", color: ORANGE }}>{app.tag}</span>}
                      </div>
                      <span className="text-[13px] font-bold shrink-0" style={{ color: NAVY }}>₹{app.price}/mo</span>
                    </div>
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTED }}>{app.desc}</p>
                    {isAdded ? (
                      <div className="mt-3 w-full text-center text-[12px] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5" style={{ background: "#EAF7EF", color: "#16A34A" }}>
                        <CheckCircle2 size={14} /> Added to your plan
                      </div>
                    ) : (
                      <button onClick={() => setConfirmOpen(app)} className="mt-3 w-full text-center text-[12px] font-bold py-2.5 rounded-xl" style={{ background: ORANGE, color: "#fff" }}>Add — ₹{app.price}/mo</button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {confirmOpen && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setConfirmOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-1">Add {confirmOpen.name}?</h3>
            <p className="text-[13px] font-semibold mb-4" style={{ color: MUTED }}>₹{confirmOpen.price}/month will be added to your next Cityline bill. You can cancel anytime.</p>
            <Card className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-semibold" style={{ color: MUTED }}>Monthly charge</span>
                <span className="text-[15px] font-bold" style={{ color: NAVY }}>₹{confirmOpen.price}</span>
              </div>
              <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: "1px solid #F1F4F9" }}>
                <span className="text-[12px] font-semibold" style={{ color: MUTED }}>Billed with</span>
                <span className="text-[12px] font-bold" style={{ color: NAVY }}>Sonic 200 (20th monthly)</span>
              </div>
            </Card>
            <PrimaryButton full tone="orange" onClick={() => { setAdded({ ...added, [confirmOpen.id]: true }); setConfirmOpen(null); }}>Confirm add-on</PrimaryButton>
            <button onClick={() => setConfirmOpen(null)} className="w-full text-center text-[13px] font-bold mt-3 py-2" style={{ color: MUTED }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DataUsageScreen({ goto, goBack }) {
  const [dayIdx, setDayIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mock hourly usage data per day (24 slots, GB) — realistic pattern with morning + evening peaks
  const days = [
    { label: "Today", date: "24 Aug 2026", total: 8.4, sessions: [
      { time: "8:12 AM", app: "Video call", gb: 1.2, type: "work" },
      { time: "1:30 PM", app: "YouTube", gb: 0.8, type: "streaming" },
      { time: "7:45 PM", app: "Netflix 4K", gb: 3.5, type: "streaming" },
      { time: "9:20 PM", app: "Web browsing", gb: 0.4, type: "browsing" },
      { time: "10:15 PM", app: "OS update", gb: 2.5, type: "download" },
    ], hourly: [0.1,0.05,0.02,0.02,0.05,0.1,0.3,0.9,1.3,0.4,0.3,0.2,0.6,1.0,0.3,0.2,0.3,0.5,0.8,3.6,0.5,0.9,2.7,0.4] },
    { label: "Yesterday", date: "23 Aug 2026", total: 12.1, sessions: [
      { time: "6:30 AM", app: "Cloud backup", gb: 2.1, type: "download" },
      { time: "11:00 AM", app: "Zoom meeting", gb: 0.9, type: "work" },
      { time: "6:00 PM", app: "IPL Live stream", gb: 4.8, type: "streaming" },
      { time: "9:30 PM", app: "Prime Video", gb: 3.2, type: "streaming" },
      { time: "11:00 PM", app: "Game download", gb: 1.1, type: "download" },
    ], hourly: [0.1,0.05,0.05,0.1,0.4,1.2,1.5,0.6,0.4,0.5,0.9,0.6,0.5,0.4,0.5,0.9,1.2,2.1,3.4,2.8,1.5,1.4,0.9,0.3] },
    { label: "2 days ago", date: "22 Aug 2026", total: 5.6, sessions: [
      { time: "9:00 AM", app: "Teams call", gb: 0.7, type: "work" },
      { time: "3:00 PM", app: "YouTube", gb: 1.1, type: "streaming" },
      { time: "8:00 PM", app: "Hotstar", gb: 2.3, type: "streaming" },
      { time: "10:30 PM", app: "Web browsing", gb: 0.6, type: "browsing" },
    ], hourly: [0.1,0.05,0.02,0.02,0.02,0.05,0.2,0.4,0.8,0.3,0.2,0.4,0.5,0.3,0.3,0.7,0.6,0.4,0.5,1.8,0.8,0.5,0.4,0.2] },
    { label: "3 days ago", date: "21 Aug 2026", total: 15.3, sessions: [
      { time: "2:00 AM", app: "System backup", gb: 3.4, type: "download" },
      { time: "10:00 AM", app: "Video call", gb: 1.5, type: "work" },
      { time: "8:00 PM", app: "Netflix 4K movie", gb: 5.5, type: "streaming" },
      { time: "10:00 PM", app: "IPL replay", gb: 3.2, type: "streaming" },
    ], hourly: [0.5,1.8,1.4,0.3,0.1,0.1,0.2,0.4,0.9,1.6,1.2,0.4,0.5,0.3,0.4,0.5,0.6,0.8,1.0,3.9,2.5,1.2,0.7,0.3] },
    { label: "4 days ago", date: "20 Aug 2026", total: 7.8, sessions: [
      { time: "9:30 AM", app: "Zoom", gb: 1.1, type: "work" },
      { time: "12:30 PM", app: "Spotify", gb: 0.4, type: "streaming" },
      { time: "7:00 PM", app: "Hotstar", gb: 2.8, type: "streaming" },
      { time: "10:00 PM", app: "Web browsing", gb: 0.9, type: "browsing" },
    ], hourly: [0.05,0.05,0.02,0.02,0.02,0.1,0.3,0.6,1.2,0.5,0.4,0.5,0.4,0.3,0.4,0.5,0.7,1.1,2.2,0.9,0.6,0.4,0.3,0.2] },
    { label: "5 days ago", date: "19 Aug 2026", total: 9.2, sessions: [
      { time: "8:00 AM", app: "Video call", gb: 0.9, type: "work" },
      { time: "6:00 PM", app: "YouTube", gb: 1.4, type: "streaming" },
      { time: "9:00 PM", app: "Netflix", gb: 4.2, type: "streaming" },
    ], hourly: [0.1,0.05,0.02,0.02,0.02,0.1,0.3,1.0,0.6,0.5,0.4,0.4,0.3,0.4,0.5,0.6,0.8,1.6,0.7,3.4,0.9,0.5,0.4,0.2] },
    { label: "6 days ago", date: "18 Aug 2026", total: 6.4, sessions: [
      { time: "10:00 AM", app: "Web browsing", gb: 0.8, type: "browsing" },
      { time: "7:30 PM", app: "Prime Video", gb: 3.1, type: "streaming" },
      { time: "10:30 PM", app: "OS updates", gb: 1.5, type: "download" },
    ], hourly: [0.05,0.05,0.02,0.02,0.05,0.1,0.2,0.3,0.5,0.9,0.4,0.3,0.4,0.3,0.4,0.5,0.6,0.7,1.3,2.0,0.7,0.5,1.6,0.4] },
  ];

  const day = days[dayIdx];
  const maxHour = Math.max(...day.hourly);
  const typeColors = { work: BLUE, streaming: "#7C3AED", browsing: "#16A34A", download: ORANGE };
  const typeLabels = { work: "Work", streaming: "Streaming", browsing: "Browsing", download: "Download" };

  return (
    <div className="pb-6">
      <ScreenHeader title="Data usage" onBack={goBack} />
      <div className="px-5">
        {/* Day selector dropdown */}
        <div className="relative mb-4">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E7EEFE" }}><Clock size={16} color={BLUE} /></div>
              <div className="text-left">
                <p className="text-[13px] font-bold" style={{ color: NAVY }}>{day.label}</p>
                <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{day.date}</p>
              </div>
            </div>
            <ChevronDown size={16} color="#94A3B8" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg z-20 overflow-hidden">
              {days.map((d, i) => (
                <button key={d.date} onClick={() => { setDayIdx(i); setDropdownOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  style={{ background: dayIdx === i ? "#E7EEFE" : "#fff", borderBottom: i < days.length - 1 ? "1px solid #F1F4F9" : "none" }}>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: NAVY }}>{d.label}</p>
                    <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{d.date} · {d.total} GB used</p>
                  </div>
                  {dayIdx === i && <CheckCircle2 size={16} color={BLUE} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Total usage card */}
        <Card className="mb-5">
          <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>TOTAL USAGE</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[28px] font-bold">{day.total}</span>
            <span className="text-[13px] font-semibold" style={{ color: NAVY }}>GB</span>
          </div>
          <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>on {day.date}</p>
        </Card>

        {/* Hourly chart */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>HOURLY BREAKDOWN</p>
        <Card className="mb-5">
          <div className="flex items-end justify-between gap-0.5" style={{ height: 100 }}>
            {day.hourly.map((val, hr) => {
              const h = Math.max(2, (val / maxHour) * 90);
              const isPeak = val > maxHour * 0.6;
              return (
                <div key={hr} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md" style={{ height: h + "px", background: isPeak ? BLUE : "#CFDCF8" }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-0.5">
            <span className="text-[10.5px] font-semibold" style={{ color: MUTED }}>12 AM</span>
            <span className="text-[10.5px] font-semibold" style={{ color: MUTED }}>6 AM</span>
            <span className="text-[10.5px] font-semibold" style={{ color: MUTED }}>12 PM</span>
            <span className="text-[10.5px] font-semibold" style={{ color: MUTED }}>6 PM</span>
            <span className="text-[10.5px] font-semibold" style={{ color: MUTED }}>11 PM</span>
          </div>
        </Card>

        {/* Session log */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>MAJOR SESSIONS</p>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          {day.sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < day.sessions.length - 1 ? "1px solid #F1F4F9" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: typeColors[s.type] + "22" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: typeColors[s.type] }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: NAVY }}>{s.app}</p>
                  <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{s.time} · {typeLabels[s.type]}</p>
                </div>
              </div>
              <span className="text-[13px] font-bold" style={{ color: NAVY }}>{s.gb} GB</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function DiagnosticsScreen({ goto, goBack }) {
  const [running, setRunning] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [rebootDone, setRebootDone] = useState(false);
  const [checks, setChecks] = useState([
    { label: "Fiber line signal", status: "pending", detail: null },
    { label: "Router connection", status: "pending", detail: null },
    { label: "Internet reachability", status: "pending", detail: null },
    { label: "DNS resolution", status: "pending", detail: null },
  ]);

  const runDiagnostics = () => {
    setRunning(true);
    const results = [
      { status: "pass", detail: "Signal strength: 92% (excellent)" },
      { status: "pass", detail: "Router responding · uptime 14d 6h" },
      { status: "pass", detail: "Ping 11ms · no packet loss" },
      { status: "pass", detail: "DNS resolving in 24ms" },
    ];
    setChecks(checks.map(c => ({ ...c, status: "pending", detail: null })));
    let i = 0;
    const runNext = () => {
      if (i >= results.length) { setRunning(false); return; }
      setChecks(prev => {
        const next = [...prev];
        next[i] = { ...next[i], ...results[i] };
        return next;
      });
      i++;
      setTimeout(runNext, 700);
    };
    setTimeout(runNext, 500);
  };

  const rebootRouter = () => {
    setRebooting(true);
    setRebootDone(false);
    setTimeout(() => { setRebooting(false); setRebootDone(true); }, 2800);
  };

  const allPassed = checks.every(c => c.status === "pass");
  const anyFailed = checks.some(c => c.status === "fail");

  return (
    <div className="pb-6">
      <ScreenHeader title="Diagnostics" onBack={goBack} />
      <div className="px-5">
        {/* Router status hero */}
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{ background: rebootDone || allPassed ? "linear-gradient(135deg, #EAF7EF 0%, #D1F0DC 100%)" : GRADIENT }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#fff" }}>
              <Router size={20} color={rebootDone || allPassed ? "#16A34A" : BLUE} />
            </div>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: rebootDone || allPassed ? NAVY : "#fff" }} className="text-[15px] font-bold">
                {rebootDone ? "Router restarted successfully" : allPassed ? "Everything looks good" : "Router is online"}
              </p>
              <p className="text-[12px] font-semibold mt-0.5"
                 style={{ color: rebootDone || allPassed ? MUTED : "rgba(255,255,255,0.8)" }}>
                {rebootDone ? "Give it 30 seconds for devices to reconnect" : allPassed ? "All diagnostic checks passed" : ROUTER_INFO.model + " · " + ROUTER_INFO.uptime + " uptime"}
              </p>
            </div>
          </div>
        </div>

        {/* Restart router — primary CTA */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>QUICK FIX</p>
        <Card className="mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDF0E7" }}>
              <RefreshCw size={16} color={ORANGE} className={rebooting ? "animate-spin" : ""} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold" style={{ color: NAVY }}>Restart your router</p>
              <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTED }}>Fixes most connectivity issues in under 2 minutes. WiFi will briefly disconnect.</p>
            </div>
          </div>
          <PrimaryButton full tone="orange" icon={rebooting ? null : RefreshCw} disabled={rebooting}
            onClick={rebootRouter}>
            {rebooting ? "Restarting router..." : rebootDone ? "Restart again" : "Restart router"}
          </PrimaryButton>
          {rebootDone && (
            <div className="mt-3 rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "#EAF7EF" }}>
              <CheckCircle2 size={14} color="#16A34A" />
              <span className="text-[12px] font-semibold" style={{ color: "#16A34A" }}>Router restarted · Reconnecting devices</span>
            </div>
          )}
        </Card>

        {/* Run diagnostics */}
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>CONNECTION HEALTH</p>
          {!running && checks.some(c => c.status !== "pending") && (
            <button onClick={runDiagnostics} className="text-[10.5px] font-bold" style={{ color: BLUE }}>Run again</button>
          )}
        </div>
        <Card style={{ padding: 0 }} className="overflow-hidden mb-5">
          {checks.map((c, i) => (
            <div key={c.label} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < checks.length - 1 ? "1px solid #F1F4F9" : "none" }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: c.status === "pass" ? "#EAF7EF" : c.status === "fail" ? "#FEEBEC" : SURFACE,
                }}>
                  {c.status === "pass" && <CheckCircle2 size={16} color="#16A34A" />}
                  {c.status === "fail" && <XCircle size={16} color="#DC2626" />}
                  {c.status === "pending" && running && <RefreshCw size={16} color={BLUE} className="animate-spin" />}
                  {c.status === "pending" && !running && <div className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: NAVY }}>{c.label}</p>
                  {c.detail && <p className="text-[10.5px] font-semibold truncate" style={{ color: MUTED }}>{c.detail}</p>}
                </div>
              </div>
            </div>
          ))}
        </Card>

        {checks.every(c => c.status === "pending") && !running && (
          <PrimaryButton full tone="blue" icon={Gauge} onClick={runDiagnostics}>Run diagnostics</PrimaryButton>
        )}

        {/* Related tools */}
        <p className="text-[10.5px] font-bold tracking-wide mb-2 mt-6 px-1" style={{ color: MUTED_LABEL }}>MORE TOOLS</p>
        <Card style={{ padding: 0 }} className="overflow-hidden">
          <button onClick={() => goto("speedtest")} className="w-full flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #F1F4F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E7F6F8" }}><Gauge size={16} color="#0891B2" /></div>
              <span className="text-[13px] font-semibold" style={{ color: NAVY }}>Run a speed test</span>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </button>
          <button onClick={() => goto("deviceDetails")} className="w-full flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #F1F4F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F1EBFE" }}><Router size={16} color="#7C3AED" /></div>
              <span className="text-[13px] font-semibold" style={{ color: NAVY }}>View router details</span>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </button>
          <button onClick={() => goto("newticket")} className="w-full flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FEEBEC" }}><Headset size={16} color="#DC2626" /></div>
              <span className="text-[13px] font-semibold" style={{ color: NAVY }}>Still not working? Raise a ticket</span>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </button>
        </Card>
      </div>
    </div>
  );
}

function ServiceDetailScreen({ goto, goBack, serviceKey }) {
  const [restarting, setRestarting] = useState(false);

  if (serviceKey === "router") {
    return (
      <div className="pb-6">
        <ScreenHeader title="Router & Device" onBack={goBack} />
        <div className="px-5">
          <div className="rounded-2xl p-4 mb-4 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full" style={{ background: "#F1EBFE" }} />
            <div className="flex items-center gap-3 relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#F1EBFE" }}><Router size={20} color="#7C3AED" /></div>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">{ROUTER_INFO.model}</p>
                <p className="text-[12px] text-[#64748B]">Serial: {ROUTER_INFO.serial}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 relative">
              <div className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>{ROUTER_INFO.signal}%</p><p className="text-[10.5px] text-[#64748B]">Signal</p></div>
              <div className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>{ROUTER_INFO.connectedDevices}</p><p className="text-[10.5px] text-[#64748B]">Devices</p></div>
              <div className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>{ROUTER_INFO.uptime}</p><p className="text-[10.5px] text-[#64748B]">Uptime</p></div>
            </div>
          </div>
          <PrimaryButton full tone="orange" disabled={restarting} onClick={() => { setRestarting(true); setTimeout(() => setRestarting(false), 2200); }} icon={RefreshCw}>
            {restarting ? "Restarting router..." : "Restart Router"}
          </PrimaryButton>
          <p className="text-[12px] text-[#94A3B8] text-center mt-2">Takes about 2 minutes. Wi-Fi will briefly disconnect.</p>
          <button onClick={() => goto("speedtest")} className="w-full mt-4">
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E7F6F8" }}><Gauge size={16} color="#0891B2" /></div>
                <span className="text-[13px] font-semibold" style={{ color: NAVY }}>Run a speed test</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </Card>
          </button>
        </div>
      </div>
    );
  }

  if (serviceKey === "ll") {
    const ll = SERVICES.find((s) => s.id === "ll");
    return (
      <div className="pb-6">
        <ScreenHeader title="Landline" onBack={goBack} />
        <div className="px-5">
          <div className="rounded-2xl p-4 mb-4 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full" style={{ background: "#FDF0E7" }} />
            <div className="flex items-center gap-3 relative mb-1">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#FDF0E7" }}><Phone size={20} color={ORANGE} /></div>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">022-4021-8845</p>
                <StatusPill status={ll.status} />
              </div>
            </div>
            <p className="text-[12px] text-[#64748B] mt-3 relative">Included free with your {ll.plan.replace("Included with ", "")} plan · unlimited local & STD calls</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>412 min</p><p className="text-[12px] text-[#64748B]">Used this cycle</p></Card>
            <Card className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>Unlimited</p><p className="text-[12px] text-[#64748B]">Local & STD</p></Card>
          </div>
          <button onClick={() => goto("landlineReport")} className="w-full mt-4">
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FEEBEC" }}><Headset size={16} color="#DC2626" /></div>
                <span className="text-[13px] font-semibold" style={{ color: NAVY }}>Report a landline issue</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </Card>
          </button>
        </div>
      </div>
    );
  }

  if (serviceKey === "ott") {
    const ott = SERVICES.find((s) => s.id === "ott");
    return (
      <div className="pb-6">
        <ScreenHeader title="OTT Subscriptions" onBack={goBack} />
        <div className="px-5">
          <div className="rounded-2xl p-4 mb-4 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full" style={{ background: "#EAF7EF" }} />
            <div className="flex items-center gap-3 relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#EAF7EF" }}><Tv size={20} color="#16A34A" /></div>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">{ott.plan}</p>
                <p className="text-[12px] text-[#64748B]">Bundled with your broadband plan</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {ott.apps.map((a) => (
              <Card key={a.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F1F4F9" }}><Tv size={16} color={NAVY} /></div>
                  <span className="text-[13px] font-semibold" style={{ color: NAVY }}>{a.name}</span>
                </div>
                {a.status === "failed" ? (
                  <button className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#FEEBEC", color: "#DC2626" }}><RefreshCw size={12} /> Retry</button>
                ) : <StatusPill status="active" />}
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <PrimaryButton full tone="orange" onClick={() => goto("addOtt")} icon={PlusCircle}>Add More OTT Apps</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  // default: broadband ("bb")
  const bb = SERVICES.find((s) => s.id === "bb");
  return (
    <div className="pb-6">
      <ScreenHeader title="Internet (Broadband)" onBack={goBack} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-4 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full" style={{ background: "#E7EEFE" }} />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#E7EEFE" }}><Wifi size={20} color={BLUE} /></div>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">{bb.plan}</p>
                <p className="text-[12px] text-[#64748B]">{bb.speed} · Fiber (FTTH)</p>
              </div>
            </div>
            <StatusPill status={bb.status} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <Card className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>{bb.daysLeft}d</p><p className="text-[10.5px] text-[#64748B]">Left</p></Card>
          <Card className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>187 Mbps</p><p className="text-[10.5px] text-[#64748B]">Last speed</p></Card>
          <Card className="text-center"><p className="text-[15px] font-bold" style={{ color: NAVY }}>99.2%</p><p className="text-[10.5px] text-[#64748B]">Uptime</p></Card>
        </div>
        <div className="flex flex-col gap-2.5">
          <button onClick={() => goto("plans")}>
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E7EEFE" }}><Zap size={16} color={BLUE} /></div><span className="text-[13px] font-semibold" style={{ color: NAVY }}>Manage plan / upgrade</span></div>
              <ChevronRight size={16} color="#94A3B8" />
            </Card>
          </button>
          <button onClick={() => goto("service", "router")}>
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F1EBFE" }}><Router size={16} color="#7C3AED" /></div><span className="text-[13px] font-semibold" style={{ color: NAVY }}>Router & device settings</span></div>
              <ChevronRight size={16} color="#94A3B8" />
            </Card>
          </button>
          <button onClick={() => goto("speedtest")}>
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E7F6F8" }}><Gauge size={16} color="#0891B2" /></div><span className="text-[13px] font-semibold" style={{ color: NAVY }}>Run a speed test</span></div>
              <ChevronRight size={16} color="#94A3B8" />
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
}

function WiFiSettingsScreen({ goto, goBack }) {
  const [ssid, setSsid] = useState(WIFI_SETTINGS.ssid);
  const [password, setPassword] = useState(WIFI_SETTINGS.password);
  const [showPass, setShowPass] = useState(false);
  const [editing, setEditing] = useState(null); // "ssid" | "password" | null
  const [guest, setGuest] = useState(WIFI_SETTINGS.guestEnabled);
  const [saved, setSaved] = useState(false);

  const Field = ({ label, value, onSave, isPassword }) => {
    const [temp, setTemp] = useState(value);
    return (
      <div className="p-4" style={{ borderBottom: "1px solid #F1F4F9" }}>
        <p className="text-[10.5px] font-bold tracking-wide mb-2" style={{ color: MUTED_LABEL }}>{label.toUpperCase()}</p>
        {editing === label ? (
          <div className="flex items-center gap-2">
            <input value={temp} onChange={(e) => setTemp(e.target.value)}
              className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-[13px] font-semibold outline-none focus:border-blue-500"
              style={{ color: NAVY }} />
            <button onClick={() => { onSave(temp); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 1500); }}
              className="text-[12px] font-bold px-3 py-2 rounded-xl" style={{ background: ORANGE, color: "#fff" }}>Save</button>
            <button onClick={() => setEditing(null)} className="text-[12px] font-bold px-3 py-2 rounded-xl" style={{ color: MUTED }}>Cancel</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[13px] font-semibold truncate" style={{ color: NAVY }}>
                {isPassword && !showPass ? "•".repeat(value.length) : value}
              </span>
              {isPassword && (
                <button onClick={() => setShowPass(!showPass)} className="shrink-0">
                  {showPass ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}
                </button>
              )}
            </div>
            <button onClick={() => setEditing(label)} className="flex items-center gap-1 text-[12px] font-bold" style={{ color: BLUE }}>
              <Edit3 size={12} /> Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-6">
      <ScreenHeader title="WiFi settings" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Manage your home WiFi network settings.</p>

        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>PRIMARY NETWORK</p>
        <Card style={{ padding: 0 }} className="overflow-hidden mb-4">
          <Field label="WiFi name (SSID)" value={ssid} onSave={setSsid} />
          <Field label="WiFi password" value={password} onSave={setPassword} isPassword />
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F1F4F9" }}>
            <div>
              <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>BAND</p>
              <p className="text-[13px] font-semibold mt-1" style={{ color: NAVY }}>{WIFI_SETTINGS.band}</p>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>SECURITY</p>
              <p className="text-[13px] font-semibold mt-1" style={{ color: NAVY }}>{WIFI_SETTINGS.security}</p>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </div>
        </Card>

        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>GUEST NETWORK</p>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-bold" style={{ color: NAVY }}>Enable guest WiFi</p>
              <p className="text-[12px] font-semibold" style={{ color: MUTED }}>Separate network with limited access</p>
            </div>
            <button onClick={() => setGuest(!guest)} className="w-11 h-6 rounded-full flex items-center px-0.5 shrink-0" style={{ background: guest ? BLUE : "#E2E8F0" }}>
              <div className="w-5 h-5 rounded-full bg-white" style={{ transform: guest ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s" }} />
            </button>
          </div>
          {guest && (
            <div className="pt-3" style={{ borderTop: "1px solid #F1F4F9" }}>
              <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>GUEST NETWORK NAME</p>
              <p className="text-[13px] font-semibold mt-1" style={{ color: NAVY }}>{WIFI_SETTINGS.guestSsid}</p>
            </div>
          )}
        </Card>

        {saved && (
          <div className="mt-4 rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "#EAF7EF" }}>
            <CheckCircle2 size={16} color="#16A34A" />
            <span className="text-[12px] font-semibold" style={{ color: "#16A34A" }}>WiFi settings saved</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceDetailsScreen({ goto, goBack }) {
  const [restarting, setRestarting] = useState(false);
  const details = [
    { label: "Model", value: ROUTER_INFO.model },
    { label: "Serial number", value: ROUTER_INFO.serial },
    { label: "MAC address", value: "88:C9:D0:11:74:03" },
    { label: "IP address", value: "192.168.1.1" },
    { label: "Firmware version", value: "v4.2.19 (latest)" },
    { label: "Uptime", value: ROUTER_INFO.uptime },
    { label: "Signal strength", value: ROUTER_INFO.signal + "%" },
    { label: "Connected devices", value: ROUTER_INFO.connectedDevices + " devices" },
  ];
  return (
    <div className="pb-6">
      <ScreenHeader title="Device details" onBack={goBack} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden bg-white" style={{ boxShadow: "0 1px 3px rgba(15,27,46,0.06)" }}>
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full" style={{ background: "#F1EBFE" }} />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#F1EBFE" }}><Router size={20} color="#7C3AED" /></div>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">{ROUTER_INFO.model}</p>
              <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{ROUTER_INFO.uptime} uptime</p>
            </div>
          </div>
        </div>

        <Card style={{ padding: 0 }} className="overflow-hidden mb-4">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid #F1F4F9" }}>
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{d.label}</span>
              <span className="text-[13px] font-semibold" style={{ color: NAVY }}>{d.value}</span>
            </div>
          ))}
        </Card>

        <PrimaryButton full tone="orange" icon={RefreshCw} disabled={restarting}
          onClick={() => { setRestarting(true); setTimeout(() => setRestarting(false), 2200); }}>
          {restarting ? "Restarting router..." : "Restart Router"}
        </PrimaryButton>
        <p className="text-[12px] font-semibold text-center mt-2" style={{ color: MUTED }}>Takes about 2 minutes. WiFi will briefly disconnect.</p>
      </div>
    </div>
  );
}

function DevicesScreen({ goto, goBack }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("online");
  const filtered = CONNECTED_DEVICES.filter((d) => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q || d.name.toLowerCase().includes(q) || d.mac.toLowerCase().includes(q);
    return d.status === tab && matchQuery;
  });
  const counts = {
    online: CONNECTED_DEVICES.filter((d) => d.status === "online").length,
    paired: CONNECTED_DEVICES.filter((d) => d.status === "paired").length,
    blocked: CONNECTED_DEVICES.filter((d) => d.status === "blocked").length,
  };
  const Row = ({ d }) => (
    <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid #F1F4F9" }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{
          background: d.status === "online" ? "#EAF7EF" : d.status === "blocked" ? "#FEEBEC" : SURFACE,
        }}>
          <Wifi size={16} color={d.status === "online" ? "#16A34A" : d.status === "blocked" ? "#DC2626" : MUTED} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold truncate" style={{ color: NAVY }}>{d.name}</p>
          <p className="text-[10.5px] font-semibold" style={{ color: MUTED }}>{d.band} · {d.ip}</p>
        </div>
      </div>
      {d.status === "blocked" ? (
        <button className="text-[12px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "#E7EEFE", color: BLUE }}>Unblock</button>
      ) : (
        <button className="text-[12px] font-bold px-3 py-1.5 rounded-lg" style={{ background: "#FEEBEC", color: "#DC2626" }}>Block</button>
      )}
    </div>
  );
  return (
    <div className="pb-6">
      <ScreenHeader title="Connected devices" onBack={goBack} />
      <div className="px-5">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2.5 mb-4">
          <Search size={16} color="#94A3B8" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by device name..."
            className="flex-1 outline-none text-[13px] font-semibold bg-transparent" style={{ color: NAVY }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {[
            { id: "online", label: "Online", count: counts.online },
            { id: "paired", label: "Paired", count: counts.paired },
            { id: "blocked", label: "Blocked", count: counts.blocked },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold flex items-center gap-1.5"
                style={{
                  background: active ? NAVY : "#fff", color: active ? "#fff" : NAVY,
                  border: active ? "1.5px solid " + NAVY : "1.5px solid #E2E8F0",
                }}>
                {t.label}
                <span className="text-[10.5px] px-1.5 rounded-full" style={{ background: active ? "rgba(255,255,255,0.2)" : SURFACE, color: active ? "#fff" : MUTED }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <Card className="text-center py-8">
            <Wifi size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No {tab} devices</p>
            {query && <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Try a different search</p>}
          </Card>
        ) : (
          <Card style={{ padding: 0 }} className="overflow-hidden">{filtered.map((d) => <Row key={d.mac} d={d} />)}</Card>
        )}
      </div>
    </div>
  );
}
function PaymentHistoryScreen({ goto, goBack }) {
  const [filter, setFilter] = useState("all");
  const filtered = INVOICES.filter((inv) => filter === "all" || inv.status === filter);
  return (
    <div className="pb-6">
      <ScreenHeader title="Payment history" onBack={goBack} />
      <div className="px-5">
        <div className="flex gap-2 mb-4 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {[{ id: "all", label: "All" }, { id: "paid", label: "Paid" }, { id: "pending", label: "Pending" }, { id: "failed", label: "Failed" }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold"
              style={{ background: filter === f.id ? NAVY : "#fff", color: filter === f.id ? "#fff" : NAVY, border: filter === f.id ? "1.5px solid " + NAVY : "1.5px solid #E2E8F0" }}>
              {f.label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <Card className="text-center py-8">
            <FileText size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No {filter === "all" ? "" : filter} payments yet</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((inv) => (
              <Card key={inv.id} onClick={() => goto("receipt", inv)} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EAF7EF" }}><CheckCircle2 size={16} color="#16A34A" /></div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: NAVY }}>{inv.id}</p>
                    <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-bold" style={{ color: NAVY }}>₹{inv.amount}</span>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BillsStatementScreen({ goto, goBack }) {
  const months = ["Jul 2026", "Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026"];
  const [emailEnabled, setEmailEnabled] = useState(true);
  return (
    <div className="pb-6">
      <ScreenHeader title="Bills & statement" onBack={goBack} />
      <div className="px-5">
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-[13px] font-bold" style={{ color: NAVY }}>Email monthly statements</p>
              <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTED }}>PDF sent to {CUSTOMER.phone.slice(0, 5)}...@gmail.com</p>
            </div>
            <button onClick={() => setEmailEnabled(!emailEnabled)} className="w-11 h-6 rounded-full flex items-center px-0.5" style={{ background: emailEnabled ? BLUE : "#E2E8F0" }}>
              <div className="w-5 h-5 rounded-full bg-white" style={{ transform: emailEnabled ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s" }} />
            </button>
          </div>
        </Card>
        <p className="text-[13px] font-bold mb-2" style={{ color: NAVY }}>Monthly statements</p>
        <div className="flex flex-col gap-2.5">
          {months.map((m) => (
            <Card key={m} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E7EEFE" }}><FileText size={16} color={BLUE} /></div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: NAVY }}>Statement — {m}</p>
                  <p className="text-[12px] font-semibold" style={{ color: MUTED }}>PDF · 24 KB</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: SURFACE }}><Download size={16} color={NAVY} /></button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddonsScreen({ goto, goBack }) {
  const iconMap = { data: BarChart3, ott: Tv, network: Wifi, hardware: Router };
  const [purchased, setPurchased] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "data", label: "Data" },
    { id: "ott", label: "OTT" },
    { id: "network", label: "Network" },
    { id: "hardware", label: "Hardware" },
  ];

  const filtered = ADDONS.filter((a) => {
    const matchesCategory = category === "all" || a.type === category;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="pb-6">
      <ScreenHeader title="Add-ons" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Boost your current plan with one-time or recurring add-ons.</p>

        {/* Search bar */}
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2.5 mb-3">
          <Search size={16} color="#94A3B8" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search add-ons..."
            className="flex-1 outline-none text-[13px] font-semibold bg-transparent" style={{ color: NAVY }} />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
          {categories.map((c) => {
            const active = category === c.id;
            return (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className="shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold"
                style={{
                  background: active ? NAVY : "#fff",
                  color: active ? "#fff" : NAVY,
                  border: active ? "1.5px solid " + NAVY : "1.5px solid #E2E8F0",
                }}>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-[13px] font-bold mb-3" style={{ color: NAVY }}>
          {filtered.length} {filtered.length === 1 ? "add-on" : "add-ons"} available
        </p>

        {/* Filtered list */}
        {filtered.length === 0 ? (
          <Card className="text-center py-8">
            <Search size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No add-ons match your search</p>
            <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Try a different keyword or category</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((a) => {
              const Icon = iconMap[a.icon] || PlusCircle;
              return (
                <Card key={a.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E7EEFE" }}><Icon size={16} color={BLUE} /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[13px] font-bold flex-1" style={{ color: NAVY }}>{a.name}</p>
                        <span className="text-[13px] font-bold shrink-0" style={{ color: NAVY }}>₹{a.price}</span>
                      </div>
                      <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTED }}>{a.desc}</p>
                      <button onClick={() => setPurchased(a)} className="mt-3 w-full text-[12px] font-bold py-2.5 rounded-xl" style={{ background: ORANGE, color: "#fff" }}>Add — ₹{a.price}</button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {purchased && (
        <div className="absolute inset-0 flex items-end z-30" style={{ background: "rgba(15,27,46,0.5)" }} onClick={() => setPurchased(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full bg-white rounded-t-3xl p-6">
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <CheckCircle2 size={36} color="#16A34A" className="mx-auto mb-3" />
            <h3 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold text-center mb-1">Add-on activated</h3>
            <p className="text-[13px] font-semibold text-center mb-5" style={{ color: MUTED }}>{purchased.name} added to your plan. ₹{purchased.price} charged.</p>
            <PrimaryButton full tone="blue" onClick={() => setPurchased(null)}>Done</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

function AutoRechargeScreen({ goto, goBack }) {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState("upi");
  return (
    <div className="pb-6">
      <ScreenHeader title="Auto-Recharge" onBack={goBack} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{ background: GRADIENT }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <RefreshCw size={20} color="#fff" className="mb-2 relative" />
          <p style={{ fontFamily: "'Poppins', sans-serif" }} className="text-white text-[19px] font-bold relative">Never miss a renewal</p>
          <p className="text-[12px] font-semibold text-white/80 mt-1 relative">Auto-charge your default payment method 3 days before expiry.</p>
        </div>
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold" style={{ color: NAVY }}>Enable Auto-Recharge</p>
              <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTED }}>Uses your saved payment method</p>
            </div>
            <button onClick={() => setEnabled(!enabled)} className="w-11 h-6 rounded-full flex items-center px-0.5" style={{ background: enabled ? BLUE : "#E2E8F0" }}>
              <div className="w-5 h-5 rounded-full bg-white" style={{ transform: enabled ? "translateX(20px)" : "translateX(0)", transition: "transform 0.2s" }} />
            </button>
          </div>
        </Card>
        {enabled && (
          <>
            <p className="text-[13px] font-bold mb-2" style={{ color: NAVY }}>Payment method</p>
            <div className="flex flex-col gap-2.5 mb-4">
              {[{ id: "upi", label: "UPI Mandate", desc: "Auto-debit via UPI (recommended)" }, { id: "card", label: "Saved Card", desc: "HDFC •••• 4451" }, { id: "netbank", label: "Netbanking Mandate", desc: "SBI account" }].map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)}>
                  <Card style={method === m.id ? { border: "1.5px solid " + BLUE } : {}} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E7EEFE" }}><CreditCard size={16} color={BLUE} /></div>
                    <div className="flex-1 text-left">
                      <p className="text-[13px] font-bold" style={{ color: NAVY }}>{m.label}</p>
                      <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{m.desc}</p>
                    </div>
                    {method === m.id && <CheckCircle2 size={18} color={BLUE} />}
                  </Card>
                </button>
              ))}
            </div>
            <PrimaryButton full tone="orange">Set up mandate</PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

function TroubleshootScreen({ goto, goBack }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="pb-6">
      <ScreenHeader title="Troubleshoot" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Common issues and self-help steps. If nothing works, raise a ticket at the bottom.</p>
        <div className="flex flex-col gap-2.5 mb-5">
          {TROUBLESHOOT_ISSUES.map((issue, i) => (
            <Card key={i} style={{ padding: 0 }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3E2" }}><AlertTriangle size={16} color="#D97706" /></div>
                  <p className="text-[13px] font-bold text-left" style={{ color: NAVY }}>{issue.title}</p>
                </div>
                <ChevronDown size={16} color="#94A3B8" style={{ transform: open === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
              </button>
              {open === i && (
                <div className="px-4 pb-4">
                  <ol className="flex flex-col gap-2 pl-1">
                    {issue.steps.map((s, si) => (
                      <li key={si} className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-bold" style={{ background: "#E7EEFE", color: BLUE }}>{si + 1}</span>
                        <span className="text-[12px] font-semibold" style={{ color: NAVY }}>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          ))}
        </div>
        <Card className="text-center">
          <p className="text-[13px] font-bold mb-1" style={{ color: NAVY }}>Still not working?</p>
          <p className="text-[12px] font-semibold mb-3" style={{ color: MUTED }}>Raise a ticket and our engineer will contact you.</p>
          <PrimaryButton full tone="orange" onClick={() => goto("newticket")}>Raise a ticket</PrimaryButton>
        </Card>
      </div>
    </div>
  );
}

function FaqsScreen({ goto, goBack }) {
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState(-1);
  const filtered = FAQS.filter((f) => {
    const q = query.trim().toLowerCase();
    return !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
  });
  return (
    <div className="pb-6">
      <ScreenHeader title="FAQs" onBack={goBack} />
      <div className="px-5">
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2.5 mb-4">
          <Search size={16} color="#94A3B8" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search FAQs..."
            className="flex-1 outline-none text-[13px] font-semibold bg-transparent" style={{ color: NAVY }} />
        </div>
        {filtered.length === 0 ? (
          <Card className="text-center py-8">
            <Search size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No FAQ matches your search</p>
            <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Try different keywords or raise a ticket</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((f, i) => (
              <Card key={i} style={{ padding: 0 }}>
                <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <p className="text-[13px] font-bold flex-1 pr-3" style={{ color: NAVY }}>{f.q}</p>
                  <ChevronDown size={16} color="#94A3B8" style={{ transform: openIdx === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </button>
                {openIdx === i && (
                  <div className="px-4 pb-4">
                    <p className="text-[12px] font-semibold leading-relaxed" style={{ color: MUTED }}>{f.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceHistoryScreen({ goto, goBack }) {
  return (
    <div className="pb-6">
      <ScreenHeader title="Invoice history" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>GST-compliant invoices for your records.</p>
        <div className="flex flex-col gap-2.5">
          {INVOICES.map((inv) => (
            <Card key={inv.id} onClick={() => goto("receipt", inv)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E7EEFE" }}><FileText size={16} color={BLUE} /></div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: NAVY }}>{inv.id}</p>
                    <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{inv.date} · GST included</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: SURFACE }}><Download size={16} color={NAVY} /></button>
              </div>
              <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid #F1F4F9" }}>
                <span className="text-[12px] font-semibold" style={{ color: MUTED }}>Total (incl. 18% GST)</span>
                <span className="text-[13px] font-bold" style={{ color: NAVY }}>₹{inv.amount}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveChatScreen({ goto, goBack }) {
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input, time: "10:16 AM" }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "agent", name: "Anita from Cityline", text: "Got it — anything else I can help with?", time: "10:17 AM" }]);
    }, 900);
  };
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader title="Live chat" onBack={goBack} />
      <div className="px-5 pb-2 flex items-center gap-2" style={{ borderBottom: "1px solid #F1F4F9" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#16A34A" }} />
        <span className="text-[12px] font-semibold" style={{ color: "#16A34A" }}>Agent online</span>
        <span className="text-[12px] font-semibold" style={{ color: MUTED }}>· Avg response: 2 min</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={"flex " + (m.from === "user" ? "justify-end" : "justify-start")}>
            <div style={{ maxWidth: "80%" }}>
              {m.from === "agent" && <p className="text-[10.5px] font-bold mb-1" style={{ color: MUTED }}>{m.name}</p>}
              <div className="rounded-2xl px-3.5 py-2.5" style={{
                background: m.from === "user" ? BLUE : "#fff",
                color: m.from === "user" ? "#fff" : NAVY,
                boxShadow: m.from === "user" ? "none" : "0 1px 3px rgba(15,27,46,0.06)",
              }}>
                <p className="text-[13px] font-semibold">{m.text}</p>
              </div>
              <p className="text-[10.5px] font-semibold mt-1" style={{ color: MUTED_LABEL, textAlign: m.from === "user" ? "right" : "left" }}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop: "1px solid #F1F4F9", background: "#fff" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-blue-500"
          style={{ color: NAVY }} />
        <button onClick={send} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: ORANGE }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function CallUsScreen({ goto, goBack }) {
  const numbers = [
    { label: "Customer support (24/7)", num: "1800-266-1234", desc: "Toll-free from any Indian number" },
    { label: "Sales & new connections", num: "1800-266-1200", desc: "Mon-Sat, 9 AM - 8 PM" },
    { label: "Technical support (priority)", num: "022-4021-8888", desc: "For P1 issues · Existing customers only" },
  ];
  return (
    <div className="pb-6">
      <ScreenHeader title="Call us" onBack={goBack} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "#E7EEFE" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#fff" }}><Phone size={18} color={BLUE} /></div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>Speak to a real person</p>
            <p className="text-[12px] font-semibold" style={{ color: MUTED }}>Average wait time: 45 seconds</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {numbers.map((n) => (
            <Card key={n.num}>
              <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{n.label}</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mt-1">{n.num}</p>
              <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>{n.desc}</p>
              <PrimaryButton full tone="orange" icon={Phone} onClick={() => {}}>Call now</PrimaryButton>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhatsappChatScreen({ goto, goBack }) {
  return (
    <div className="pb-6">
      <ScreenHeader title="WhatsApp chat" onBack={goBack} />
      <div className="px-5 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mt-4" style={{ background: "#EAF7EF" }}>
          <CheckCircle2 size={40} color="#16A34A" />
        </div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-2">Chat with us on WhatsApp</h2>
        <p className="text-[13px] font-semibold mb-6" style={{ color: MUTED }}>Get instant support on WhatsApp. Fastest response times, message history saved to your phone.</p>
        <Card className="w-full mb-4">
          <p className="text-[12px] font-semibold" style={{ color: MUTED }}>OFFICIAL CITYLINE WHATSAPP</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mt-1">+91 98765 43210</p>
          <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>Green tick verified · Available 24/7</p>
        </Card>
        <PrimaryButton full tone="orange" icon={Send}>Open WhatsApp</PrimaryButton>
      </div>
    </div>
  );
}

function HelpfulTipsScreen({ goto, goBack }) {
  const [query, setQuery] = useState("");
  const iconMap = { wifi: Wifi, gauge: Gauge, router: Router, shield: ShieldCheck, tv: Tv, phone: Phone };
  const filtered = HELPFUL_TIPS.filter((t) => {
    const q = query.trim().toLowerCase();
    return !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });
  return (
    <div className="pb-6">
      <ScreenHeader title="Helpful tips" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Get more out of your Cityline connection.</p>
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2.5 mb-4">
          <Search size={16} color="#94A3B8" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tips..."
            className="flex-1 outline-none text-[13px] font-semibold bg-transparent" style={{ color: NAVY }} />
        </div>
        {filtered.length === 0 ? (
          <Card className="text-center py-8">
            <Sparkles size={20} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>No tips match your search</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((tip, i) => {
              const Icon = iconMap[tip.icon] || Sparkles;
              return (
                <Card key={i}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EAF7EF" }}><Icon size={16} color="#16A34A" /></div>
                    <div className="flex-1">
                      <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>{tip.category.toUpperCase()}</p>
                      <p className="text-[13px] font-bold mt-1" style={{ color: NAVY }}>{tip.title}</p>
                      <p className="text-[12px] font-semibold mt-1" style={{ color: MUTED }}>{tip.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackServiceRequestScreen({ goto, goBack }) {
  return (
    <div className="pb-6">
      <ScreenHeader title="Track service request" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Status of all your service requests raised with Cityline.</p>
        <div className="flex flex-col gap-2.5">
          {SERVICE_REQUESTS.map((r) => (
            <Card key={r.id}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-[13px] font-bold" style={{ color: NAVY }}>{r.type}</p>
                <StatusPill status={r.status === "Resolved" ? "active" : "pending"} />
              </div>
              <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{r.id} · Raised {r.raised}</p>
              <p className="text-[12px] font-semibold mt-2" style={{ color: NAVY }}>{r.desc}</p>
              {r.status !== "Resolved" && (
                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid #F1F4F9" }}>
                  <Clock size={16} color={ORANGE} />
                  <span className="text-[12px] font-semibold" style={{ color: ORANGE }}>Expected by {r.eta}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function RelocateScreen({ goto, goBack }) {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  if (step === 3) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EAF7EF" }}><CheckCircle2 size={32} color="#16A34A" /></div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-2">Relocation request received</h2>
        <p className="text-[13px] font-semibold mb-6" style={{ color: MUTED }}>Our team will check feasibility at the new address and confirm within 48 hours.</p>
        <PrimaryButton full tone="blue" onClick={() => goto("profile")}>Done</PrimaryButton>
      </div>
    );
  }
  return (
    <div className="pb-6">
      <ScreenHeader title="Relocate connection" onBack={() => step === 1 ? goBack() : setStep(step - 1)} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "#E7EEFE" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "#fff" }}><MapPin size={18} color={BLUE} /></div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>Shift your Cityline connection</p>
            <p className="text-[12px] font-semibold" style={{ color: MUTED }}>Free relocation within our coverage area</p>
          </div>
        </div>
        <Card className="mb-4">
          <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>CURRENT ADDRESS</p>
          <p className="text-[13px] font-semibold mt-1" style={{ color: NAVY }}>B-402, Sunrise Heights, Andheri West, Mumbai 400058</p>
        </Card>
        {step === 1 && (
          <>
            <label className="text-[10.5px] font-bold tracking-wide mb-2 block" style={{ color: MUTED_LABEL }}>NEW ADDRESS</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={4} placeholder="Enter full new address including pin code..."
              className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-3.5 text-[13px] font-semibold outline-none focus:border-blue-500 mb-6 resize-none" style={{ color: NAVY }} />
            <PrimaryButton full tone="blue" disabled={!address} onClick={() => setStep(2)}>Check feasibility</PrimaryButton>
          </>
        )}
        {step === 2 && (
          <>
            <div className="rounded-xl px-3 py-2 flex items-center gap-2 mb-4" style={{ background: "#EAF7EF" }}>
              <CheckCircle2 size={16} color="#16A34A" />
              <span className="text-[12px] font-semibold" style={{ color: "#16A34A" }}>Cityline serves this area</span>
            </div>
            <label className="text-[10.5px] font-bold tracking-wide mb-2 block" style={{ color: MUTED_LABEL }}>PREFERRED SHIFT DATE</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-[13px] font-semibold outline-none focus:border-blue-500 mb-6" style={{ color: NAVY }} />
            <PrimaryButton full tone="orange" disabled={!date} onClick={() => setStep(3)}>Submit request</PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

function TrackOrderScreen({ goto, goBack }) {
  return (
    <div className="pb-6">
      <ScreenHeader title="Track new order" onBack={goBack} />
      <div className="px-5">
        <p className="text-[12px] font-semibold mb-4" style={{ color: MUTED }}>Status of your recent orders (add-ons, hardware, activations).</p>
        <div className="flex flex-col gap-2.5">
          {NEW_ORDERS.map((o) => (
            <Card key={o.id}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-[13px] font-bold" style={{ color: NAVY }}>{o.type}</p>
                <StatusPill status={o.status === "Activated" ? "active" : "pending"} />
              </div>
              <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{o.id} · Placed {o.placed}</p>
              <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid #F1F4F9" }}>
                <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{o.eta === "—" ? "Delivered" : "ETA " + o.eta}</span>
                <span className="text-[13px] font-bold" style={{ color: NAVY }}>₹{o.amount}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function OwnershipTransferScreen({ goto, goBack }) {
  const [step, setStep] = useState(1);
  const [newOwner, setNewOwner] = useState({ name: "", phone: "", aadhaar: "" });
  if (step === 2) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EAF7EF" }}><CheckCircle2 size={32} color="#16A34A" /></div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-2">Transfer request submitted</h2>
        <p className="text-[13px] font-semibold mb-6" style={{ color: MUTED }}>The new owner will receive an OTP to confirm. After KYC verification, ownership will be transferred within 3 working days.</p>
        <PrimaryButton full tone="blue" onClick={() => goto("profile")}>Done</PrimaryButton>
      </div>
    );
  }
  return (
    <div className="pb-6">
      <ScreenHeader title="Ownership transfer" onBack={goBack} />
      <div className="px-5">
        <div className="rounded-2xl p-4 mb-5 flex items-start gap-3" style={{ background: "#FEF3E2" }}>
          <AlertTriangle size={16} color="#D97706" className="mt-0.5 shrink-0" />
          <p className="text-[12px] font-semibold leading-snug" style={{ color: "#8A5A0C" }}>Once transferred, the new owner will have full control over billing, plan, and cancellation. This cannot be reversed.</p>
        </div>
        <Card className="mb-4">
          <p className="text-[10.5px] font-bold tracking-wide" style={{ color: MUTED_LABEL }}>CURRENT OWNER</p>
          <p className="text-[13px] font-semibold mt-1" style={{ color: NAVY }}>{CUSTOMER.name}</p>
          <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{CUSTOMER.phone}</p>
        </Card>
        <p className="text-[10.5px] font-bold tracking-wide mb-2 px-1" style={{ color: MUTED_LABEL }}>NEW OWNER DETAILS</p>
        <div className="flex flex-col gap-2.5 mb-6">
          <input value={newOwner.name} onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })} placeholder="Full name"
            className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-[13px] font-semibold outline-none focus:border-blue-500" style={{ color: NAVY }} />
          <input value={newOwner.phone} onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="Mobile number"
            className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-[13px] font-semibold outline-none focus:border-blue-500" style={{ color: NAVY }} />
          <input value={newOwner.aadhaar} onChange={(e) => setNewOwner({ ...newOwner, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12) })} placeholder="Aadhaar number"
            className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-[13px] font-semibold outline-none focus:border-blue-500" style={{ color: NAVY }} />
        </div>
        <PrimaryButton full tone="orange" disabled={!newOwner.name || !newOwner.phone || !newOwner.aadhaar} onClick={() => setStep(2)}>Submit transfer request</PrimaryButton>
      </div>
    </div>
  );
}

function TrackCancellationScreen({ goto, goBack }) {
  return (
    <div className="pb-6">
      <ScreenHeader title="Track cancellation" onBack={goBack} />
      <div className="px-5">
        <Card className="text-center py-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#EAF7EF" }}>
            <CheckCircle2 size={32} color="#16A34A" />
          </div>
          <p className="text-[15px] font-bold mb-1" style={{ color: NAVY }}>No active cancellation</p>
          <p className="text-[13px] font-semibold mb-5" style={{ color: MUTED }}>Your Cityline connection is active. We're glad you're with us.</p>
          <button onClick={() => goto("profile")} className="text-[12px] font-bold" style={{ color: ORANGE }}>Request termination →</button>
        </Card>
        <p className="text-[10.5px] font-bold tracking-wide mb-2 mt-6 px-1" style={{ color: MUTED_LABEL }}>PAST CANCELLATION REQUESTS</p>
        <Card className="text-center py-6">
          <p className="text-[13px] font-semibold" style={{ color: MUTED }}>You've never cancelled with Cityline. Thanks for being a loyal customer!</p>
        </Card>
      </div>
    </div>
  );
}

function UsefulLinksScreen({ goto, goBack }) {
  const tiles = [
    { icon: Clock, label: "Track service request", desc: "Status of raised requests", action: () => goto("trackServiceRequest") },
    { icon: MapPin, label: "Relocate connection", desc: "Shift to a new address", action: () => goto("relocate") },
    { icon: Wifi, label: "Linked accounts", desc: "Manage multiple connections", action: () => goto("linkAccount") },
    { icon: FileText, label: "Track new order", desc: "Add-ons and hardware", action: () => goto("trackOrder") },
    { icon: RefreshCw, label: "Ownership transfer", desc: "Transfer to another person", action: () => goto("ownershipTransfer") },
    { icon: XCircle, label: "Track cancellation", desc: "Cancellation status", action: () => goto("trackCancellation") },
  ];
  return (
    <div className="pb-6">
      <ScreenHeader title="Useful links" onBack={goBack} />
      <div className="px-5">
        {/* Hero */}
        <div className="rounded-2xl p-4 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FDF0E7 0%, #FBDBBF 100%)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#fff" }}>
            <Sparkles size={18} color={ORANGE} />
          </div>
          <p style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[15px] font-bold">Useful links</p>
          <p className="text-[12px] font-semibold mt-1" style={{ color: NAVY, opacity: 0.75 }}>Track requests, relocate, transfer, and more.</p>
        </div>

        {/* Full list — one card per option with icon + title + desc */}
        <div className="flex flex-col gap-2.5">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.label} onClick={t.action} className="w-full">
                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E7EEFE" }}>
                      <Icon size={16} color={BLUE} />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-bold" style={{ color: NAVY }}>{t.label}</p>
                      <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{t.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LinkAccountScreen({ goto, goBack }) {
  const options = [
    { icon: Wifi, label: "Residential Broadband", desc: "Home fiber connection", bg: "#E7EEFE", fg: BLUE },
    { icon: Router, label: "Enterprise ILL", desc: "Business leased line", bg: "#F1EBFE", fg: "#7C3AED" },
    { icon: Phone, label: "Landline Only", desc: "Voice service", bg: "#FDF0E7", fg: ORANGE },
    { icon: Tv, label: "OTT Standalone", desc: "TV subscription only", bg: "#EAF7EF", fg: "#16A34A" },
  ];
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#EAF7EF" }}><CheckCircle2 size={32} color="#16A34A" /></div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: NAVY }} className="text-[19px] font-bold mb-2">Link request sent</h2>
        <p className="text-[13px] font-semibold mb-6" style={{ color: MUTED }}>Our team will verify your ownership and link this account within 24 hours.</p>
        <PrimaryButton full tone="blue" onClick={() => goto("home")}>Back to Home</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Link Account" onBack={goBack} />
      <div className="px-5">
        <p className="text-[13px] font-semibold mb-4" style={{ color: MUTED }}>Choose the type of connection you want to link to your account.</p>
        <div className="flex flex-col gap-2.5 mb-5">
          {options.map((o) => {
            const Icon = o.icon;
            const active = selected === o.label;
            return (
              <button key={o.label} onClick={() => setSelected(o.label)}>
                <Card style={active ? { border: `1.5px solid ${BLUE}` } : {}} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: o.bg }}><Icon size={18} color={o.fg} /></div>
                  <div className="flex-1 text-left">
                    <p className="text-[13px] font-bold" style={{ color: NAVY }}>{o.label}</p>
                    <p className="text-[12px] font-semibold" style={{ color: MUTED }}>{o.desc}</p>
                  </div>
                  {active && <CheckCircle2 size={18} color={BLUE} />}
                </Card>
              </button>
            );
          })}
        </div>
        {selected && (
          <>
            <label className="text-[12px] font-bold mb-1.5 block" style={{ color: MUTED }}>CUSTOMER ID OR MOBILE NUMBER</label>
            <input placeholder="Enter your ID (e.g. RES-2026-...)"
              className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 mb-5 outline-none focus:border-blue-500 text-[13px] font-semibold" style={{ color: NAVY }} />
            <PrimaryButton full tone="blue" onClick={() => setSubmitted(true)}>Send Verification</PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Root app ---------------- */

export default function CitylineApp() {
  const [phase, setPhase] = useState("splash");
  const [history, setHistory] = useState([{ kind: "tab", value: "home", data: null }]);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  const current = history[history.length - 1];
  const tab = current.kind === "tab" ? current.value : (history.slice().reverse().find(e => e.kind === "tab") || { value: "home" }).value;
  const screen = current.kind === "screen" ? current.value : null;
  const screenData = current.data;

  const goto = (name, data) => {
    if (name === "login") { setPhase("login"); setHistory([{ kind: "tab", value: "home", data: null }]); return; }
    const isTab = ["home", "recharge", "support", "profile"].includes(name);
    const newEntry = { kind: isTab ? "tab" : "screen", value: name, data: data || null };
    // Avoid pushing the same screen twice in a row
    if (current.kind === newEntry.kind && current.value === newEntry.value) return;
    setHistory([...history, newEntry]);
  };

  const goBack = () => {
    if (history.length <= 1) return; // Already at root
    setHistory(history.slice(0, -1));
  };

  const addTicket = ({ service, category, desc }) => {
    const id = `TCK-${1000 + tickets.length + 1}`;
    setTickets([{ id, service, category, status: "In Progress", created: "07 Jul 2026", timeline: [
      { label: "Ticket raised", done: true, time: "Just now" }, { label: "Assigned to engineer", done: false, time: null },
      { label: "In progress", done: false, time: null }, { label: "Resolved", done: false, time: null } ] }, ...tickets]);
  };

  let content;
  if (screen === "newticket") content = <NewTicketScreen goto={goto} goBack={goBack} onSubmit={addTicket} />;
  else if (screen === "ticketDetail") content = <TicketDetailScreen goto={goto} goBack={goBack} data={screenData} />;
  else if (screen === "speedtest") content = <SpeedTestScreen goto={goto} goBack={goBack} />;
  else if (screen === "stats") content = <StatsScreen goto={goto} goBack={goBack} />;
  else if (screen === "receipt") content = <ReceiptScreen goto={goto} goBack={goBack} invoice={screenData} />;
  else if (screen === "notifications") content = <NotificationsScreen goto={goto} goBack={goBack} />;
  else if (screen === "service") content = <ServiceDetailScreen goto={goto} goBack={goBack} serviceKey={screenData} />;
  else if (screen === "linkAccount") content = <LinkAccountScreen goto={goto} goBack={goBack} />;
  else if (screen === "devices") content = <DevicesScreen goto={goto} goBack={goBack} />;
  else if (screen === "paymentHistory") content = <PaymentHistoryScreen goto={goto} goBack={goBack} />;
  else if (screen === "billsStatement") content = <BillsStatementScreen goto={goto} goBack={goBack} />;
  else if (screen === "addons") content = <AddonsScreen goto={goto} goBack={goBack} />;
  else if (screen === "autoRecharge") content = <AutoRechargeScreen goto={goto} goBack={goBack} />;
  else if (screen === "troubleshoot") content = <TroubleshootScreen goto={goto} goBack={goBack} />;
  else if (screen === "faqs") content = <FaqsScreen goto={goto} goBack={goBack} />;
  else if (screen === "wifiSettings") content = <WiFiSettingsScreen goto={goto} goBack={goBack} />;
  else if (screen === "deviceDetails") content = <DeviceDetailsScreen goto={goto} goBack={goBack} />;
  else if (screen === "invoiceHistory") content = <InvoiceHistoryScreen goto={goto} goBack={goBack} />;
  else if (screen === "liveChat") content = <LiveChatScreen goto={goto} goBack={goBack} />;
  else if (screen === "callUs") content = <CallUsScreen goto={goto} goBack={goBack} />;
  else if (screen === "whatsapp") content = <WhatsappChatScreen goto={goto} goBack={goBack} />;
  else if (screen === "helpfulTips") content = <HelpfulTipsScreen goto={goto} goBack={goBack} />;
  else if (screen === "trackServiceRequest") content = <TrackServiceRequestScreen goto={goto} goBack={goBack} />;
  else if (screen === "relocate") content = <RelocateScreen goto={goto} goBack={goBack} />;
  else if (screen === "trackOrder") content = <TrackOrderScreen goto={goto} goBack={goBack} />;
  else if (screen === "ownershipTransfer") content = <OwnershipTransferScreen goto={goto} goBack={goBack} />;
  else if (screen === "trackCancellation") content = <TrackCancellationScreen goto={goto} goBack={goBack} />;
  else if (screen === "usefulLinks") content = <UsefulLinksScreen goto={goto} goBack={goBack} />;
  else if (screen === "landlineReport") content = <LandlineReportScreen goto={goto} goBack={goBack} />;
  else if (screen === "addOtt") content = <AddOttScreen goto={goto} goBack={goBack} />;
  else if (screen === "dataUsage") content = <DataUsageScreen goto={goto} goBack={goBack} />;
  else if (screen === "diagnostics") content = <DiagnosticsScreen goto={goto} goBack={goBack} />;
  else if (tab === "home") content = <HomeScreen goto={goto} goBack={goBack} />;
  else if (screen === "plans") content = <PlansScreen goto={goto} goBack={goBack} />;
  else if (tab === "recharge") content = <RechargeScreen goto={goto} goBack={goBack} />;
  else if (tab === "support") content = <SupportScreen goto={goto} goBack={goBack} tickets={tickets} />;
  else if (tab === "profile") content = <ProfileScreen goto={goto} goBack={goBack} />;

  const showNav = !["newticket", "speedtest", "ticketDetail", "stats", "receipt", "notifications", "service", "linkAccount", "devices", "paymentHistory", "billsStatement", "addons", "autoRecharge", "troubleshoot", "faqs", "wifiSettings", "deviceDetails", "invoiceHistory", "liveChat", "callUs", "whatsapp", "helpfulTips", "trackServiceRequest", "relocate", "trackOrder", "ownershipTransfer", "trackCancellation", "plans", "usefulLinks", "dataUsage", "diagnostics"].includes(screen);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#E7EBF0", fontFamily: "'Poppins', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div className="relative overflow-hidden" style={{ width: 390, height: 780, background: SURFACE, borderRadius: 44, boxShadow: "0 20px 60px rgba(15,27,46,0.25)", border: `8px solid ${NAVY}` }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl z-40" style={{ background: NAVY }} />
        <div className="w-full h-full overflow-y-auto" style={{ paddingBottom: phase === "app" && showNav ? 80 : 0 }}>
          {phase === "splash" && <SplashScreen onDone={() => setPhase("login")} />}
          {phase === "login" && <LoginScreen onLoggedIn={() => { setPhase("app"); setHistory([{ kind: "tab", value: "home", data: null }]); }} />}
          {phase === "app" && content}
        </div>
        {phase === "app" && showNav && <BottomNav tab={tab} setTab={(t) => goto(t)} />}
      </div>
    </div>
  );
}
