import React from 'react'
import Carousel from './EventCarousel'
import AboutUs from './AboutUs'
import FeaturedPrograms from './FeaturedPrograms'
import Events from './Events'
import Students from './Students'
import Testimonials from './Testimonials'
import QualityEducation from './QualityEducation'
import RecentNews from './RecentNews'
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