import { useState } from 'react';
import './App.css';
import Stockchart from './Stockchart';

function App() {
  const [symbol,setSymbol] = useState('')
  const [timeinterval,settimeInterval] = useState('')

  return (
    <>
    <div style={{width:'100%',height:'10vh',display:'flex',alignItems:'center',justifyContent:"center",color:"white",fontSize:"35px"}}>
      Stocks Data
    </div>
    <div style={{
      width:"100%",height:"10vh",display:'flex',alignItems:'center',justifyContent:'center',marginBottom:"20px"
    }}>
      <label style={{color:"white",marginRight:'5px'}}>Company</label>
      <select onChange={(e)=>{setSymbol(e.target.value)}} style={{width:"10rem",height:"3rem",marginRight:"10px",borderRadius:"10px"}} >
        <option value='' >select</option>
        <option value="AAPL">AAPL</option>
        <option value="IBM">IBM</option>
        <option value="NVDA">NVDA</option>
        <option value="TSLA">TSLA</option>
      </select>
      <label style={{color:"white",marginRight:"5px"}}>TimeInterval</label>
      <select onChange={(e)=>{settimeInterval(e.target.value)}} style={{width:"10rem",height:"3rem",borderRadius:'10px'}} >
        <option value=''>select</option>
        <option value="1min">1 Minute</option>
        <option value="5min">5 Minutes</option>
        <option value="15min">15 Minutes</option>
        <option value="30min">30 Minutes</option>
      </select>
    </div>
    {
      symbol!=='' && timeinterval!==''?(
        <>
        <div style={{width:"100%",height:"70vh",display:"flex",alignItems:'center',justifyContent:'center'}}>
        <Stockchart symbol={symbol} timeinterval={timeinterval} />
        </div>
        
        
        </>
      ):(
        <>
        <div style={{width:"100%",height:"50vh",display:'flex',alignItems:'center',justifyContent:"center",color:"white",fontSize:"30px"}} >
          Please give input
          </div>
        </>
      )
    }
    
    
    </>
  );
}

export default App;
