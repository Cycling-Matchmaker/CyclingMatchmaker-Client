import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import "../../styles/create-ride.css";
import { gql, useMutation } from "@apollo/client";
import { extractRouteInfo } from "../../util/GpxHandler";
import { AuthContext } from "../../context/auth";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const CreateRide = () => {
    const navigate = useNavigate();
    const context = useContext(AuthContext);
    const [errors, setErrors] = useState({});
    const [rsvp, setRSVP] = useState(false);

    const [rideName, setRideName] = useState<string>("");
    const [rideDate, setRideDate] = useState<string>("");
    const [rideTime, setRideTime] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [bikeType, setBikeType] = useState<string[] | never[]>([]);
    const [difficulty, setDifficulty] = useState<string>("");
    const [rideAverageSpeed, setRideAverageSpeed] = useState<string>("");
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const [eventID, setEventID] = useState<string>("");

    const [values, setValues] = useState({

        // Event
        host: context.user?.username,
        name: "",
        startTime: "",
        description: "",
        bikeType: [""],
        difficulty: "",
        wattsPerKilo: 0,
        intensity: "n/a",

        // Route
        points: [[0,0]],
        elevation: [0],
        grade: [0],
        terrain: [""],
        distance: 0,
        maxElevation: 0,
        minElevation: 0,
        totalElevationGain: 0,
        startCoordinates: [0,0],
        endCoordinates: [0,0],
    })

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prevValues) => ({
        ...prevValues,
        name: e.target.value,
        }));
        setRideName(e.target.value);
    }

    const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValues((prevValues) => ({
        ...prevValues,
        description: e.target.value,
        }));
        setDesc(e.target.value);
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked, id } = event.target;
        var newBikes = [...bikeType];
        if (id == "bike") {
            if (checked) {
                newBikes.push(name);
                setBikeType(newBikes);
            } else {
                newBikes = newBikes.filter(item => item !== name);
                setBikeType(newBikes);
            }
        }
        setValues((prevValues) => ({
            ...prevValues,
            bikeType: newBikes,
        }));
    };

    const handleRSVP = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setRSVP(checked);
    }

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValues((prevValues) => ({
        ...prevValues,
        difficulty: e.target.value,
        }));
        setDifficulty(e.target.value);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRideDate(e.target.value);
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRideTime(e.target.value);
    }


    function refreshDate() {
        if(rideDate && rideTime) {
            const mergedDate: string = `${rideDate}T${rideTime}:00.000`;
            const dateString: string = new Date(mergedDate).toISOString();

            setValues((prevValues) => ({
            ...prevValues,
            startTime: dateString,
            }));
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    const routeInfo = await extractRouteInfo(file);
                    setValues((prevValues) => ({
                        ...prevValues,
                        points: routeInfo.points,
                        elevation: routeInfo.elevation,
                        distance: routeInfo.distance,
                        maxElevation: routeInfo.max_elevation,
                        minElevation: routeInfo.min_elevation,
                        totalElevationGain: routeInfo.total_elevation_gain,
                        startCoordinates: routeInfo.startCoordinates,
                        endCoordinates: routeInfo.endCoordinates,
                    }));
                    setFileUploaded(true);
                } catch (error) {
                    console.error('Error parsing GPX:', error);
                }
          }
        } catch (error) {
            console.error('Error loading GPX file:', error);
        }
    };

    const handleButtonClick = () => {
        addEvent();
        notify(); // Call notify function here
    };

    const token: string | null = localStorage.getItem("jwtToken");

    const [addEvent, { loading }] = useMutation(CREATE_EVENT_MUTATION, {
        onError(err) {
            setErrors(err.graphQLErrors);
            const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception?.errors
            const errorMessage = Object.values(errorObject).flat().join(', ');
            setErrors(errorMessage);
        },
        onCompleted(data) {
            console.log(data);
            if (rsvp) {
                setEventID(data.createEvent._id);
            }
            setTimeout(() => {
                navigate("/app/profile");
            }, 1500);
        },
        context: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        variables: values,
    });

    const [joinRide] = useMutation(JOIN_RIDE, {
        onError(err) {
            setErrors(err.graphQLErrors);
            const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception?.errors
            const errorMessage = Object.values(errorObject).flat().join(', ');
            setErrors(errorMessage);
        },
        context: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        variables: {
            eventID: eventID,
        }
    })

    useEffect(() => {
        if (rsvp) joinRide();
    }, [eventID]);

    useEffect(() => {
        refreshDate();
    }, [rideDate, rideTime]);

    const enableButton = () => {
        return rideName != "" && rideDate != "" && 
        rideTime != "" && bikeType.length !== 0 && 
        difficulty != "" && rideAverageSpeed != "" &&
        fileUploaded;
    }

    const toastStyle = {
        background: 'lightgreen', // Change background color to light green
        color: 'black', // Change text color
    };

    // Custom toast container style
    const toastContainerStyle = {
        width: 'auto', // Adjust width as needed
        textAlign: 'center', // Center the toast
    };
    const notify = () => toast("Ride Created!");


    return (
        
        <>
            <Navbar />
            <div className="create-ride-main-container" >
                <div className="create-ride-form-container" >
                    
                    <h2>Create a ride</h2>
                    
                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-name" >Ride name</label>
                        <input id="ride-name" onChange={handleNameChange} type="text" value={rideName} />
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-date" >Date</label>
                        <input id="ride-date" onChange={handleDateChange} type="date" value={rideDate} min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-start-time" >Start time</label>
                        <input id="ride-start-time" onChange={handleTimeChange} type="time" value={rideTime} />
                    </div>

                    <div className="create-ride-form-input">
                        <label htmlFor="ride-difficulty">Watts/kilo</label>
                        <select id="ride-difficulty" value={difficulty} onChange={handleDifficultyChange} >
                            <option value="" disabled>-- Select difficulty --</option>
                            <option value="Above 4.5">Above 4.5</option>
                            <option value="4.1 to 4.5">4.1 to 4.5</option>
                            <option value="3.8 to 4.1">3.8 to 4.1</option>
                            <option value="3.5 to 3.8">3.5 to 3.8</option>
                            <option value="3.2 to 3.5">3.2 to 3.5</option>
                            <option value="2.9 to 3.2">2.9 to 3.2</option>
                            <option value="2.6 to 2.9">2.6 to 2.9</option>
                            <option value="2.3 to 2.6">2.3 to 2.6</option>
                            <option value="2.0 to 2.3">2.0 to 2.3</option>
                            <option value="Below 2.0">Below 2.0</option>
                        </select>
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-average-speed" >Average speed (mph)</label>
                        <input id="ride-average-speed" onChange={e => setRideAverageSpeed(e.target.value)} type="number" />
                    </div>

                    <div className="rides-feed-filter-options" >
                            <h5>Bike type</h5>
                            <label htmlFor="mountain-bike" >
                                <input name="Mountain" onChange={handleCheckboxChange} id="bike" type="checkbox" /> Mountain
                            </label>
                            <label htmlFor="road-bike" >
                                <input name="Road" onChange={handleCheckboxChange} id="bike" type="checkbox" /> Road
                            </label>
                            <label htmlFor="hybrid-bike" >
                                <input name="Hybrid" onChange={handleCheckboxChange} id="bike" type="checkbox" /> Hybrid
                            </label>
                            <label htmlFor="touring-bike" >
                                <input name="Touring" onChange={handleCheckboxChange} id="bike" type="checkbox" /> Touring
                            </label>
                            <label htmlFor="gravel-bike" >
                                <input name="Gravel" onChange={handleCheckboxChange} id="bike" type="checkbox" /> Gravel
                            </label>
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-description" >Description</label>
                        <textarea
                            placeholder="Enter details such as number of stops, rules,"
                            id="ride-name"
                            onChange={handleDescChange}
                            value={desc}
                        />
                    </div>

                    <div className="create-ride-form-input" >
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <input type="file" onChange={handleFileSelect} accept=".gpx" />
                        </div>
                    </div>

                    <div className="create-ride-form-input">
                        <label htmlFor="rsvp" >
                            <input name="rsvp" onChange={handleRSVP} id="rsvp" type="checkbox" /> RSVP me for this ride
                        </label>
                    </div>
                    
                    <Button
                        disabled={!enableButton()}
                        onClick={handleButtonClick}
                        type="primary"
                    >
                        Create ride
                    </ Button>
                    <ToastContainer
                    
                toastStyle={toastStyle}
                autoClose={1000} 

            />
               
                </div>
            </div>
        </>
    )
};

const JOIN_RIDE = gql`
    mutation joinEvent($eventID: String!) {
        joinEvent(eventID: $eventID) {
            _id
        }
    }
`

const CREATE_EVENT_MUTATION = gql`
  mutation createEvent(
    $host: String!
    $name: String!
    $startTime: Date!
    $description: String!
    $bikeType: [String!]
    $difficulty: String!
    $wattsPerKilo: Float!
    $intensity: String!
    $points: [[Float]]!
    $elevation: [Float]!
    $grade: [Float]!
    $terrain: [String]!
    $distance: Float!
    $maxElevation: Float!
    $minElevation: Float!
    $totalElevationGain: Float!
    $startCoordinates: [Float]!
    $endCoordinates: [Float]!
  ) {
    createEvent(
      createEventInput: {
        host: $host
        name: $name
        startTime: $startTime
        description: $description
        bikeType: $bikeType
        difficulty: $difficulty
        wattsPerKilo: $wattsPerKilo
        intensity: $intensity
        points: $points
        elevation: $elevation
        grade: $grade
        terrain: $terrain
        distance: $distance
        maxElevation: $maxElevation
        minElevation: $minElevation
        totalElevationGain: $totalElevationGain
        startCoordinates: $startCoordinates
        endCoordinates: $endCoordinates
      }
    ) {
      _id
    }
  }
`;

export default CreateRide;