
export async function getAccessToken(req,res) {
      try {
    
      const {code} = req.body
      if (!code) {
        return res.status(400).json({message:'No auth code provided'})
      }
      const params = new URLSearchParams()
      params.append('client_id',process.env.KEAP_CLIENT_ID)
      params.append('client_secret',process.env.KEAP_CLIENT_SECRET)
      params.append('code',code)
      params.append('grant_type','authorization_code')
      params.append('redirect_uri',process.env.KEAP_REDIRECT_URI)
    //   console.log(params.toString())
      const response =  await fetch(process.env.KEAP_TOKEN_URL,{
        method: 'POST',
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:params.toString(),
      })

      const data = await response.json();
    //   console.log('-----')
    //   console.log(data)
      return res.status(200).json(data)
      

  } catch (error) {
    console.error(error)
    return res.status(500).json({mensaje:'Internal error', error: error})
  }

}

export async function refreshToken(req,res){
    try {
        const {refresh_token} = req.body
        const params = new URLSearchParams()

        params.append('grant_type','refresh_token')
        params.append('refresh_token', refresh_token)
        
        const response = await fetch('https://api.infusionsoft.com/token',
            {
                method: 'post',
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(process.env.KEAP_CLIENT_ID + ':' + process.env.KEAP_CLIENT_SECRET)}` //btoa to base64encode
                },
                body:params.toString()
            }
        )
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error("Keap API error: " + response.status + ' '+ errorText );
            

        }
        const data = await response.json()
        return res.status(200).json(data)

    } catch (error) {
        console.error(error)
        return res.status(500).json({mensaje: 'internal error', error: error})

    }
}
