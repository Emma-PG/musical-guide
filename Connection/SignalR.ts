'use client'
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5171/chatHub")
  .build();

export default connection;
