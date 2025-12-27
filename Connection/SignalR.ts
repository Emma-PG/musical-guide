'use client'
import { useEffect, useState } from 'react'
import * as signalR from "@microsoft/signalr";

export function useSignalR() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/api/chatHub")
      .withAutomaticReconnect()
      .build()

    hubConnection.start()
      .then(() => {
        setConnection(hubConnection)
        setIsConnected(true)
        setError(null)
      })
      .catch((err: Error) => {
        setError(err)
        setIsConnected(false)
      })

    return () => {
      if (hubConnection.state === signalR.HubConnectionState.Connected) {
        hubConnection.stop()
      }
    }
  }, [])

  return { connection, isConnected, error }
}
