import {
  useTheme,
  Link,
  Button,
  Loading,
  Flex,
  Container,
  Typography,
  Input,
  Spacing,
} from "@wipsie/ui";
import DefaultLayout from "../components/DefaultLayout";
import NextLink from "next/link";
import { isProd } from "../config";
import { useSelector, useDispatch } from "react-redux";
import { buyCake } from "../redux/slices/cake";
import { fetchUsers } from "../redux/slices/user";
import { fetchPosts } from "../redux/slices/blog";
import { useEffect, useState } from "react";

import axios from "axios";
import io from "socket.io-client";

export default function Home(props) {
  const [accessToken, setAccessToken] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [listenEvent, setListenEvent] = useState([]);
  const [newEvent, setNewEvent] = useState("");
  const [messages, setMessages] = useState([]);

  // Socket setup start
  const [socket, setSocket] = useState(null);

  async function connect() {
    if (socket != null) {
      socket.disconnect();
    }

    const authApi = axios.create({
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    if (socket != null) {
      socket.disconnect();
    }

    // const currentSessionRequest = await authApi.post(`/api/auth/session`);
    // const currentSession = currentSessionRequest.data;

    const _socket = io("https://env.dev.api.wipsie.com", {
      path: "/sockets/socket.io/",
      query: {
        pageRefId: roomId,
        token: accessToken,
      },
    });

    setSocket(_socket);
  }

  return (
    <>
      <Container m={2}>
        <Typography variant="h1">Access Token </Typography>
        <Input
          value={accessToken}
          onChange={(event: any) => setAccessToken(event.target.value)}
        ></Input>

        <Spacing height={2} />

        <Typography variant="h1">Room ID</Typography>
        <Input
          value={roomId}
          onChange={(event: any) => setRoomId(event.target.value)}
        ></Input>

        <Spacing height={2} />

        {socket != null ? (
          <>
            <Typography variant="h1">New Event</Typography>
            <Input
              value={newEvent}
              onChange={(event: any) => setNewEvent(event.target.value)}
            ></Input>
            <Button
              onClick={() => {
                const _newEvent = newEvent;
                setNewEvent("");

                socket.on(_newEvent, (data) =>
                  setMessages((messages) => [
                    ...messages,
                    { event: _newEvent, data },
                  ])
                );

                setListenEvent((listenEvent) => {
                  return [...listenEvent, _newEvent];
                });
              }}
            >
              Add
            </Button>

            {listenEvent.map((value, index) => {
              return (
                <Container>
                  <Typography key={index} variant="h3">
                    {value}
                  </Typography>
                  <Button
                    onClick={() => {
                      if (socket) {
                        socket.off(value);

                        setListenEvent((listenEvent) => {
                          return listenEvent.filter((item) => item !== value);
                        });
                      }
                    }}
                    backgroundColor="danger"
                  >
                    Remove
                  </Button>
                </Container>
              );
            })}
            <Spacing height={2} />
          </>
        ) : null}

        <Button onClick={() => connect()}>Conectar</Button>
      </Container>
      <Container m={2}>
        <Typography variant="h2">Messages</Typography>
        <Spacing height={3} />
        {messages.map((message, index) => {
          return (
            <>
              <Typography key={index} variant="h3">
                {message.event} - {JSON.stringify(message.data)}
              </Typography>
              <Spacing height={3} />
            </>
          );
        })}
      </Container>
    </>
  );
}
