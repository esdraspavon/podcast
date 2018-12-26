import 'isomorphic-fetch'
import Link from 'next/link'
import Layout from '../components/Layout';
import ChannelGrid from '../components/ChannelGrid';
// import PodcastList from '../components/PodcastList';
import PodcastListWithClick from '../components/PodcastListWithClick';
import Error from './_error'
import PodcastPlayer from '../components/PodcastPlayer'

export default class extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = { openPodcast: null }
  }

  static async getInitialProps({ query, res }){
    try{

      let idChannel = query.id
      
      let [reqChannel, reqSeries, reqAudio ] = await Promise.all([
        fetch(`https://api.audioboom.com/channels/${ idChannel }`),
        fetch(`https://api.audioboom.com/channels/${ idChannel }/child_channels`),
        fetch(`https://api.audioboom.com/channels/${ idChannel }/audio_clips`),
        
      ])
      if(reqChannel.status >= 404) {
        res.statusCode=reqChannel.status
        return { channel:null, audioClips:null, series:null, statusCode:404}

      }
      
      // let reqChannel = await fetch(`https://api.audioboom.com/channels/${ idChannel }`)
      // // let { body: { channel } } = await reqChannel.json()
      let dataChannel = await reqChannel.json()
      let channel = dataChannel.body.channel
      
      let dataAudios = await reqAudio.json()
      let audioClips = dataAudios.body.audio_clips
      
      let dataSeries = await reqSeries.json()
      let series = dataSeries.body.channels
      
      return { channel, audioClips, series, statusCode:200 }
    } catch(e) {
      res.statusCode=503

      return { channel:null, audioClips:null, series:null, statusCode:503}
    }
      
    }
    
  openPodcast = (event, podcast) => {
    event.preventDefault()
    this.setState({
      openPodcast: podcast
    })
  }

  closePodcast = (event) => {
    event.preventDefault()
    this.setState({
      openPodcast: null
    })
  }
    
    render() {
      const { channel, audioClips, series, statusCode } = this.props
      const { openPodcast } = this.state
      
      if( statusCode !== 200){
        return <Error statusCode={statusCode} />
      }
    return <Layout title={channel.title}>
      <div className="banner" style={{ backgroundImage: `url(${channel.urls.banner_image.original})` }} />

      { openPodcast && 
        <PodcastPlayer clip={ openPodcast } onClose= { this.closePodcast } />
      }

      <h1>{ channel.title }</h1>

      { series.length > 0 &&
        <div>
          <h2>Series</h2>
          <ChannelGrid channels={ series }/>
        </div>
      }

      <h2>Ultimos Podcasts</h2>
        {/* <PodcastList audioClips={audioClips} /> */}
        <PodcastListWithClick podcasts={audioClips}  onClickPodcast={this.openPodcast}/>
      

      <style jsx>{`

        .banner {
          width: 100%;
          padding-bottom: 25%;
          background-position: 50% 50%;
          background-size: cover;
          background-color: #aaa;
        }

        
        h1 {
          font-weight: 600;
          padding: 15px;
        }
        h2 {
          padding: 5px;
          font-size: 0.9em;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }

        
      `}</style>
      
      </Layout>
  }
}