export const courts = [
  {
    id: "316-tennis",
    name: "Three Sixteen Tennis",
    shortName: "316 Tennis",
    address: "4629 Murfreesboro Rd, Franklin, TN 37067",
    phone: "(615) 604-3218",
    website: "https://www.threesixteentennis.com/",
    bookingPlatform: "Court Reserve",
    bookingUrl: "https://app.courtreserve.com/",
    bookingAppIos: "https://apps.apple.com/app/court-reserve/id1447850498",
    bookingAppAndroid: "https://play.google.com/store/apps/details?id=com.courtreserve.app",
    hoursDisplay: {
      "Mon-Fri": "7am–10pm",
      "Saturday": "6am–9pm",
      "Sunday": "6am–2pm"
    },
    hoursSchedule: {
      mon: { open: 7, close: 22 },
      tue: { open: 7, close: 22 },
      wed: { open: 7, close: 22 },
      thu: { open: 7, close: 22 },
      fri: { open: 7, close: 22 },
      sat: { open: 6, close: 21 },
      sun: { open: 6, close: 14 }
    },
    pricingDisplay: "$40/hr (Players)",
    pricingDetail: "Founding Members: $300/mo (8 hours included)",
    bookingRules: "Players book 3 days ahead · Members 4 days ahead",
    drive: { andrey: "8 min", lucas: "25 min" },
    driveMinutes: { andrey: 8, lucas: 25 },
    coords: [35.9088, -86.7987],
    theme: "gradient-blue"
  },
  {
    id: "farm-forge",
    name: "Farm and Forge Club",
    shortName: "Farm & Forge",
    address: "8445 Horton Highway, College Grove, TN 37046",
    phone: "Contact via website",
    website: "https://farmandforgeclub.com/",
    bookingPlatform: "Club Automation",
    bookingUrl: "https://farmandforge.clubautomation.com/",
    tennisPage: "https://farmandforgeclub.com/tennis/",
    instagram: "@thefarmandforgeclub",
    hoursDisplay: {
      "Daily": "7am–9pm (members)"
    },
    hoursSchedule: {
      mon: { open: 7, close: 21 },
      tue: { open: 7, close: 21 },
      wed: { open: 7, close: 21 },
      thu: { open: 7, close: 21 },
      fri: { open: 7, close: 21 },
      sat: { open: 7, close: 21 },
      sun: { open: 7, close: 21 }
    },
    pricingDisplay: "Contact",
    pricingDetail: "Premium private club · Membership required",
    bookingRules: "Member login required",
    drive: { andrey: "20 min", lucas: "30 min" },
    driveMinutes: { andrey: 20, lucas: 30 },
    coords: [35.7445, -86.7034],
    theme: "gradient-lilac"
  },
  {
    id: "adams",
    name: "Adams Tennis Complex",
    shortName: "Adams",
    address: "925 Golf Lane, Murfreesboro, TN 37133",
    phone: "(615) 546-4000",
    website: "https://www.murfreesborotn.gov/807/Adams-Tennis-Complex",
    bookingPlatform: "City of Murfreesboro",
    bookingUrl: "https://www.murfreesborotn.gov/facilities/facility/details/Adams-Tennis-Complex-27",
    hoursDisplay: {
      "Mon-Fri": "6am–9pm",
      "Sat-Sun": "8am–7pm"
    },
    hoursSchedule: {
      mon: { open: 6, close: 21 },
      tue: { open: 6, close: 21 },
      wed: { open: 6, close: 21 },
      thu: { open: 6, close: 21 },
      fri: { open: 6, close: 21 },
      sat: { open: 8, close: 19 },
      sun: { open: 8, close: 19 }
    },
    pricingDisplay: "$15–20",
    pricingDetail: "Members free within 24hrs · $12/hr if >24hrs",
    bookingRules: "Non-members pay daily + court fee",
    drive: { andrey: "30 min", lucas: "8 min" },
    driveMinutes: { andrey: 30, lucas: 8 },
    coords: [35.8497, -86.3899],
    theme: "gradient-mint"
  }
];
