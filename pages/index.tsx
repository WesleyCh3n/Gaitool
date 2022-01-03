import type { NextPage } from 'next'
import DrawChart from './Chart'

const Home: NextPage = () => {
  return (
    <div>
      <DrawChart />
      {/* <DrawChart key={"2"}/> */}
    </div>
  )
}

export default Home
