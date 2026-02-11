import React from 'react'
import Carousel from './EventCarousel'
import AboutUs from './AboutUs'
import Events from './Events'


import WhyChoice from './WhyChoice'


function Home() {
  return (
    <div className='main'>
<Carousel />
<AboutUs />
<WhyChoice />
{/* <FeaturedPrograms />
<Students />
<Testimonials /> */}
{/* <QualityEducation /> */}
{/* <RecentNews /> */}
<Events />
    </div>
  )
}

export default Home