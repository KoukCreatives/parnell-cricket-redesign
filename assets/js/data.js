/*
 * SITE CONTENT – the only file volunteers need to touch.
 * In Webflow these become CMS collections; in WordPress, custom post types / ACF options.
 * Dates are YYYY-MM-DD (NZ time).
 */
const IMG = "https://cdn.prod.website-files.com/";

window.SITE = {
  /* One season message, shown at the top of every page. Edit once, updates everywhere. */
  season: {
    label: "2026/27 season",
    message: "Senior registrations are open. Junior grades are full – join the waitlist and we'll be in touch as places free up.",
    short: "Seniors open · Juniors waitlist",   // shown on phones
    cta: { text: "Join the club", href: "https://www.parnellcricket.co.nz/register" }
  },

  /* Events: upcoming first, then past events from the last `recentDays` (marked "Past"), then gone. */
  recentDays: 120,
  events: [
    {
      title: "Thirdman Thursdays",
      repeatWeekly: true,               // shows the next Thursday until `end`
      date: "2026-10-15",
      end: "2027-03-25",
      place: "Shore Road Clubrooms",
      summary: "Our weekly social night through the season. Out on the boundary? Nope – the fun is at the club!",
      image: IMG + "650e4c20299a53936d88c704/6abd9e7c6994b1df64f30931_thirdman-thursdays-poster.png",
      alt: "Thirdman Thursdays poster",
      href: "https://www.parnellcricket.co.nz/event/thirdman-thursdays"
    },
    {
      title: "Parnell Cricket Club Quiz Night",
      date: "2026-10-22",
      time: "6.30pm",
      place: "Parnell Cricket Clubhouse, Shore Rd",
      summary: "A fundraising night of fun, quiz and friendship. Pay at the door or reserve a table.",
      image: IMG + "650e4c20299a53936d88c704/6abd97aa05647e930f37fff0_83ec5fd6-3f94-48ea-aa33-7932417b75d5.png",
      alt: "Parnell Cricket Club quiz night poster",
      href: "https://www.parnellcricket.co.nz/event/parnell-cricket-quiz-night"
    },
    {
      title: "October School Holiday Programme",
      date: "2026-10-05",
      place: "Parnell Cricket Club, Shore Road",
      summary: "Our October 2026 school holiday cricket programme for junior players.",
      image: IMG + "650e4c20299a53936d88c704/6ab30c5cf3b6a6b80dbb429a_parnell-cricket-october-2026-poster%20(1)_Page_1.png",
      alt: "October 2026 school holiday programme poster",
      href: "https://www.parnellcricket.co.nz/event/school-holiday-programme"
    }
  ],

  /* News: each post shows until `hideAfter` (optional). Otherwise posts older than
     `newsFreshDays` drop off the homepage on their own (they stay in the News archive). */
  newsFreshDays: 365,
  news: [
    {
      title: "PCC Senior Women in India",
      date: "2026-04-24",
      tag: "Women's cricket",
      summary: "Six PCC Youth girls joined the Kiwi Caps Youth tour for 15–18 year olds, led by Jacob Oram, over the school holidays.",
      image: IMG + "650e4c20299a53936d88c704/680a3af78f16478ea4bcc0dd_438217f4-b729-4a72-bb6a-ab1c613d5d03.jpeg",
      alt: "Parnell players on tour in India, in front of the Taj Mahal",
      href: "https://www.parnellcricket.co.nz/blog-posts/pcc-senior-women-in-india-april-2025"
    },
    {
      title: "Ana Wijffels named in Netherlands U19 World Cup squad",
      date: "2024-07-17",
      tag: "Player spotlight",
      summary: "Congratulations to Ana on her selection for the Netherlands U19 squad.",
      image: IMG + "650e4c20299a53936d88c704/669db3a9b1685bf83526a835_1734140969139669752.jpg",
      alt: "Players gathered in the field in front of the scoreboard",
      href: "https://www.parnellcricket.co.nz/blog-posts/congratulations-for-ana-wijffels-selected-in-netherlands-u-19-world-cup-squad"
    },
    {
      title: "Ruben Clinton debuts for MI New York",
      date: "2024-07-07",
      tag: "Player spotlight",
      summary: "Former Parnell player Ruben Clinton makes his Major League Cricket debut.",
      image: IMG + "650e4c20299a53936d88c704/669db3ea0a1d7d1ef91be714_449716367_1202677097355251_4774103054548484936_n.jpg",
      alt: "Scorecard from Ruben Clinton's debut for MI New York",
      href: "https://www.parnellcricket.co.nz/blog-posts/ruben-clinton-on-debut-for-mi-new-york"
    }
  ],

  /* Sponsors: every logo links to the sponsor's own site. */
  sponsors: [
    { name: "Astra Radiology", href: "https://astraradiology.co.nz/", logo: IMG + "650e4c20299a53936d88c704/650edad6becf38efda9ab920_astra-radiology-white_500.png" },
    { name: "New World Remuera", href: "https://www.newworld.co.nz/upper-north-island/auckland/remuera", logo: IMG + "650e4c20299a53936d88c704/650edb1e25167461fb3b7d2f_new-world-white_500.png" },
    { name: "Westferry", href: "https://www.westferry.co.nz/", logo: IMG + "650e4c20299a53936d88c704/650edbe89c7332290b2e66c4_westferry-white_500.png" },
    { name: "Players Sports", href: "https://www.playerssports.co.nz/products/category/500/parnell-cricket-club", logo: IMG + "650e4c20299a53936d88c704/650edac6deb4bb6ff2267cdf_player-sports-white_500.png" },
    { name: "PlaceMakers", href: "https://www.placemakers.co.nz/online/", logo: IMG + "650e4c20299a53936d88c704/650edbc1d96dabfaacf8b639_placemakers-white_500.png" },
    { name: "TransBuild", href: "https://transbuild.co.nz/", logo: IMG + "650e4c20299a53936d88c704/650edbff5608c727a78ba5a5_transbuild-white_500.png" },
    // General Capital only supplied a colour logo; `knockout` turns it into a white-on-transparent
    // version in the browser so it matches the others. Swap for an official mono logo when supplied.
    { name: "General Capital", href: "https://gencap.co.nz/", logo: "", knockout: IMG + "650e4c20299a53936d88c704/69aa9377270d5dd932a05404_General%20Capital%20(1).jpg" }
  ]
};
