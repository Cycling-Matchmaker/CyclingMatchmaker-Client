import React, { useEffect, useContext, useState } from 'react';
import Navbar from "../../components/Navbar";
import GpxMap from "../GpxMap"; // Replace with the correct path
import "../../styles/profile-page.css";
import mockUserData from "../../mockData/userMockUp.json";
import { AuthContext } from "../../context/auth";
import { useSearchParams } from "react-router-dom";
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';

const ProfilePage = () => {

  const { user } = useContext(AuthContext);

  let username: string | null = null;
  if (user) {
    username = user.username;
  }
  const token: string | null = localStorage.getItem("jwtToken");

  //console.log(username);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParameters = new URLSearchParams(window.location.search);

  const scope = queryParameters.get("scope");
  const code = queryParameters.get("code");

  const [values, setValues] = useState({
    code: "",
    scope: "",
  });

  
  const {loading: eventLoading, error: eventErr, data: eventData } = useQuery(GET_EVENTS, {variables: {
    username: user?.username,
  },
  });

  const { loading: userLoading, error, data: userData} = useQuery(FETCH_USER_QUERY, {
    variables: {
        username: user?.username,
    },
    });

    // strava query
    const [stravaError, setStravaError] = useState({});
    const [stravaLink, setStravaLink] = useState<string>("");
    const [requestStravaAuthorization ,{ loading: stravaLoading, error: stravaErr, data: stravaData }] = useLazyQuery(REQUEST_STRAVA, {
        context: {
            headers: {
              // Your headers go here
              Authorization: `Bearer ${token}`, // Example for authorization header
            },
          },
      onCompleted() {
          setStravaLink(stravaData.requestStravaAuthorization)
          redirectToExternalLink(stravaData.requestStravaAuthorization)
      },
      onError: (error) => {
          setStravaError(error);
          console.log(error)
          console.error("GraphQL Mutation Error:", error);
          console.log("GraphQL Errors:", error.graphQLErrors);

        },
    });

    const redirectToExternalLink = (link: string) => {
       window.location.href = link;
       //window.open(link);
     };

  const [exchangeStrava, { loading }] = useMutation(EXCHANGE_STRAVA, {
      context: {
        headers: {
          // Your headers go here
          Authorization: `Bearer ${token}`, // Example for authorization header
        },
      },
    onCompleted() {
      console.log("successStrava:")
    },
    onError(err) {
        console.error("GraphQL Mutation Error:", err);
        console.log("GraphQL Errors:", err.graphQLErrors);
    },
    variables: values,
  });

  useEffect(() => {
    if(!searchParams.has("scope") && !searchParams.has("code")) {
      requestStravaAuthorization();
    }
    if (searchParams.has("scope")) {
      const scope = searchParams.get("scope");
      if (scope) {
        searchParams.delete("scope");
        setSearchParams(searchParams);
      }
    }
    if (searchParams.has("code")) {
        const code = searchParams.get("code");
        if (code) {
          searchParams.delete("code");
          setSearchParams(searchParams);
        }
      }
    if(searchParams.has("state")) {
        searchParams.delete("state");
        setSearchParams(searchParams);
    }
    if(code && scope) {
      setValues({code, scope});
    }
  }, []);

  useEffect(() => {
    if(values.code !== "") {
      console.log(values)
      exchangeStrava();
    }
  }, [values])


  return (
    <div className="profile-page-main-container">
      <Navbar />
      <div className="profile-page-grid">
        <h3 className="profile-page-welcome-message">Welcome back, <b>{userData?.getUser.firstName}</b>!</h3>
        <div className="profile-page-user-events">
          <div className="profile-page-user-event">
            <h4>Your rides</h4>
            <div>
              {eventData?.getEvents[0].name}
            </div>
            <div>
              {eventData?.getEvents[0].startTime}
            </div>
            <div>
              {eventData?.getEvents[1].name}
            </div>
            <div>
              {eventData?.getEvents[1].startTime}
            </div>
          </div>
          <div className="profile-page-user-event">
            <h4>Rides you joined</h4>
            <div>
              {mockUserData.eventsJoined.length > 0 ? mockUserData.eventsJoined.map((e) => <div key={e}>{e}</div>) : <div className="profile-page-user-event-no-rides-text">No rides to show</div>}
            </div>
          </div>
        </div>
        <div className="profile-page-user-stats">
          <h4>Your stats</h4>
          <div className="profile-page-user-stats-data">
            <div>
              <div>FTP</div>
              <div>{userData?.getUser.FTP}</div>
            </div>
            <div>
              <div>Last FTP</div>
              <div>{userData?.getUser.FTPdate}</div>
            </div>
            <div>
              <div>Weight</div>
              <div>{userData?.getUser.weight} kg</div>
            </div>
            <div>
              <div>Birthday</div>
              <div>{userData?.getUser.birthday}</div>
            </div>
            <div>
              <div>Experience level</div>
              <div>Advanced</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const EXCHANGE_STRAVA = gql`
mutation exchangeStravaAuthorizationCode(
    $code: String!
    $scope: String!
  ) {
    exchangeStravaAuthorizationCode(
        code: $code
        scope: $scope
    )
  }
`;

const REQUEST_STRAVA = gql`
  query requestStravaAuthorization {
    requestStravaAuthorization
  }
`;


const FETCH_USER_QUERY = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
        FTP
        weight
        FTPdate
        birthday
        firstName
    }
  }
`;

const GET_EVENTS = gql`
  query getEvents($username: String!) {
    getEvents(username: $username) {
        name
        startTime
    }
  }
`;
export default ProfilePage;
