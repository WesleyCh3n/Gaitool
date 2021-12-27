import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import DrawChart from './components/chart/Chart'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <DrawChart />
    </div>
  )
}

export default Home
