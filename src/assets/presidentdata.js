
  export const presidentsData = [
    {
      id: 'biden',
      name: 'Joe Biden',
      term: '2021 - Present',
      image:
        'https://www.whitehouse.gov/wp-content/uploads/2021/04/P20210303AS-1901-cropped.jpg',
      cabinetSize: 24,
      departments: 15,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Kamala Harris' },
        { position: 'Secretary of State', name: 'Antony Blinken' },
        { position: 'Secretary of Treasury', name: 'Janet Yellen' },
        { position: 'Secretary of Defense', name: 'Lloyd Austin' },
        { position: 'Attorney General', name: 'Merrick Garland' },
      ],
      keyEvents: [
        'COVID-19 pandemic response',
        'American Rescue Plan',
        'Infrastructure Investment and Jobs Act',
        'Ukraine-Russia conflict',
        'Inflation Reduction Act',
      ],
    },
    {
      id: 'trump',
      name: 'Donald Trump',
      term: '2017 - 2021',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/56/Donald_Trump_official_portrait.jpg',
      cabinetSize: 24,
      departments: 15,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Mike Pence' },
        { position: 'Secretary of State', name: 'Mike Pompeo (2018-2021)' },
        { position: 'Secretary of Treasury', name: 'Steven Mnuchin' },
        { position: 'Secretary of Defense', name: 'Mark Esper (2019-2020)' },
        { position: 'Attorney General', name: 'William Barr (2019-2020)' },
      ],
      keyEvents: [
        'Tax Cuts and Jobs Act',
        'COVID-19 pandemic begins',
        'US-Mexico-Canada Agreement',
        'Withdrawal from Paris Climate Agreement',
        'First Step Act',
      ],
    },
    {
      id: 'obama',
      name: 'Barack Obama',
      term: '2009 - 2017',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/8/8d/President_Barack_Obama.jpg',
      cabinetSize: 23,
      departments: 15,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Joe Biden' },
        { position: 'Secretary of State', name: 'Hillary Clinton (2009-2013)' },
        {
          position: 'Secretary of Treasury',
          name: 'Timothy Geithner (2009-2013)',
        },
        { position: 'Secretary of Defense', name: 'Robert Gates (2009-2011)' },
        { position: 'Attorney General', name: 'Eric Holder (2009-2015)' },
      ],
      keyEvents: [
        'Affordable Care Act',
        'Recovery from Great Recession',
        'Dodd-Frank Wall Street Reform',
        'Paris Climate Agreement',
        'Iran Nuclear Deal',
      ],
    },
    {
      id: 'bush',
      name: 'George W. Bush',
      term: '2001 - 2009',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/d/d4/George-W-Bush.jpeg',
      cabinetSize: 21,
      departments: 15,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Dick Cheney' },
        { position: 'Secretary of State', name: 'Colin Powell (2001-2005)' },
        { position: 'Secretary of Treasury', name: 'Henry Paulson (2006-2009)' },
        { position: 'Secretary of Defense', name: 'Donald Rumsfeld (2001-2006)' },
        { position: 'Attorney General', name: 'John Ashcroft (2001-2005)' },
      ],
      keyEvents: [
        '9/11 Terrorist Attacks',
        'Iraq War',
        'No Child Left Behind Act',
        'Medicare Prescription Drug Benefit',
        '2008 Financial Crisis',
      ],
    },
    {
      id: 'clinton',
      name: 'Bill Clinton',
      term: '1993 - 2001',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/d/d3/Bill_Clinton.jpg',
      cabinetSize: 19,
      departments: 14,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Al Gore' },
        {
          position: 'Secretary of State',
          name: 'Madeleine Albright (1997-2001)',
        },
        { position: 'Secretary of Treasury', name: 'Robert Rubin (1995-1999)' },
        { position: 'Secretary of Defense', name: 'William Perry (1994-1997)' },
        { position: 'Attorney General', name: 'Janet Reno' },
      ],
      keyEvents: [
        'Economic expansion and budget surplus',
        'NAFTA implementation',
        'Welfare Reform Act',
        'Kosovo intervention',
        'Impeachment and acquittal',
      ],
    },
    {
      id: 'bush_sr',
      name: 'George H. W. Bush',
      term: '1989 - 1993',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/e/ee/George_H._W._Bush_presidential_portrait_%28cropped%29.jpg',
      cabinetSize: 17,
      departments: 14,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Dan Quayle' },
        { position: 'Secretary of State', name: 'James Baker' },
        { position: 'Secretary of Treasury', name: 'Nicholas Brady' },
        { position: 'Secretary of Defense', name: 'Dick Cheney' },
        { position: 'Attorney General', name: 'Dick Thornburgh (1989-1991)' },
      ],
      keyEvents: [
        'Gulf War',
        'Fall of the Berlin Wall',
        'Americans with Disabilities Act',
        'Clean Air Act Amendments',
        'NAFTA negotiations',
      ],
    },
    {
      id: 'reagan',
      name: 'Ronald Reagan',
      term: '1981 - 1989',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/1/16/Official_Portrait_of_President_Reagan_1981.jpg',
      cabinetSize: 16,
      departments: 13,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'George H. W. Bush' },
        { position: 'Secretary of State', name: 'George Shultz (1982-1989)' },
        { position: 'Secretary of Treasury', name: 'James Baker (1985-1988)' },
        {
          position: 'Secretary of Defense',
          name: 'Caspar Weinberger (1981-1987)',
        },
        { position: 'Attorney General', name: 'Edwin Meese (1985-1988)' },
      ],
      keyEvents: [
        'Economic Recovery Tax Act',
        'Cold War policies',
        'Iran-Contra affair',
        'INF Treaty with Soviet Union',
        'Star Wars defense initiative',
      ],
    },
    {
      id: 'carter',
      name: 'Jimmy Carter',
      term: '1977 - 1981',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/5a/JimmyCarterPortrait2.jpg',
      cabinetSize: 15,
      departments: 13,
      keyCabinetMembers: [
        { position: 'Vice President', name: 'Walter Mondale' },
        { position: 'Secretary of State', name: 'Cyrus Vance (1977-1980)' },
        {
          position: 'Secretary of Treasury',
          name: 'W. Michael Blumenthal (1977-1979)',
        },
        { position: 'Secretary of Defense', name: 'Harold Brown' },
        { position: 'Attorney General', name: 'Griffin Bell (1977-1979)' },
      ],
      keyEvents: [
        'Department of Energy creation',
        'Camp David Accords',
        'Iran Hostage Crisis',
        'Panama Canal Treaties',
        'Energy crisis',
      ],
    },
  ]
  