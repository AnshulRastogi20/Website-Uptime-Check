"use client"

import {useAuth} from "@clerk/nextjs"
import { useEffect, useState } from "react"
import axios from "axios"
import { API_BACKEND_URL } from "@/config"


interface Website{
    id: string;
    url: string;
    ticks: {
        id: string;
        status: string;
        createdAt: string;
        latency: number;
    }[];
}



export function useWebsites(){
    const {getToken} = useAuth()
    const [websites, setWebsites] = useState<Website[]>([])
    


    async function refreshWebsites(){
        const token = await getToken()
        if (token) console.log(token);
        const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`,{
            headers:{
                Authorization: token
            }
        })

        setWebsites(response.data.websites)
    }


    useEffect(()=>{

        refreshWebsites();

        const interval = setInterval(()=>{
            refreshWebsites();
        },1000 * 60 * 10)

        return ()=>{
            clearInterval(interval)
        }


    },[])


    return {websites, refreshWebsites};
}

