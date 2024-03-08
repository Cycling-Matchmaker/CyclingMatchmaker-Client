import { useState, useEffect } from "react";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import "../../styles/create-ride.css";
import { gql, useMutation } from "@apollo/client";
import { extractRouteInfo } from "../../util/GpxHandler";

const CreateRide = () => {

    const [difficulty, setDifficulty] = useState("");
    const [bicycleType, setBicycleType] = useState("");
    const [errors, setErrors] = useState({});

    const [values, setValues] = useState({

        // Event
        host: "",
        name: "",
        startTime: "",
        description: "",
        bikeType: "",
        difficulty: "",
        wattsPerKilo: 0,
        intensity: "",

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
    }

    const handleDescChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prevValues) => ({
        ...prevValues,
        description: e.target.value,
        }));
    }

    const handleBikeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValues((prevValues) => ({
        ...prevValues,
        bikeType: e.target.value,
        }));
        setBicycleType(e.target.value);
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
                } catch (error) {
                    console.error('Error parsing GPX:', error);
                }
          }
        } catch (error) {
            console.error('Error loading GPX file:', error);
        }
    };


    const [addEvent, { loading }] = useMutation(CREATE_EVENT_MUTATION, {
        onError(err) {
            setErrors(err.graphQLErrors);
            const errorObject = (err.graphQLErrors[0] as any)?.extensions?.exception?.errors
            const errorMessage = Object.values(errorObject).flat().join(', ');
            setErrors(errorMessage);
        },
        variables: values,
    });

    useEffect(() => {
        console.log(values);
    }, [values]);


    return (
        <>
            <Navbar />
            <div className="create-ride-main-container" >
                <div className="create-ride-form-container" >
                    
                    <h2>Create a ride</h2>
                    
                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-name" >Ride name</label>
                        <input id="ride-name" onChange={handleNameChange} type="text" />
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-name" >Date</label>
                        <input id="ride-name" onChange={() => null} type="date" min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-name" >Start time</label>
                        <input id="ride-name" onChange={() => null} type="time" />
                    </div>

                    <div className="create-ride-form-input">
                        <label htmlFor="difficulty">Watts/kilo</label>
                        <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="" disabled>-- Select difficulty --</option>
                            <option value="Very hard">A+ - 4.6+</option>
                            <option value="Hard">A - 4.0 to 4.6</option>
                            <option value="Medium">B - 3.2 to 4.0</option>
                            <option value="Easy">C - 2.5 to 3.2</option>
                        </select>
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="bicycle-type" >Bicycle type</label>
                        <select id="bicycle-type" value={bicycleType} onChange={handleBikeChange}>
                            <option value="" disabled >-- Select bicycle type --</option>
                            <option value="Mountain bike" >Mountain bike</option>
                            <option value="Road bike" >Road bike</option>
                            <option value="Hybrid bike" >Hybrid bike</option>
                            <option value="Touring bike" >Touring bike</option>
                            <option value="Gravel bike" >Gravel bike</option>
                        </select>
                    </div>

                    <div className="create-ride-form-input" >
                        <label htmlFor="ride-name" >Description</label>
                        <input id="ride-name" onChange={handleDescChange} type="text" />
                    </div>

                    <div className="create-ride-form-input" >
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <input type="file" onChange={handleFileSelect} />
                        </div>
                    </div>

                    <Button type="primary" onClick={addEvent}>Create ride</ Button>
                </div>
            </div>
        </>
    )
};

const CREATE_EVENT_MUTATION = gql`
  mutation createEvent(
    $host: String!
    $name: String!
    $startTime: String!
    $description: String!
    $bikeType: String!
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
      id
    }
  }
`;

export default CreateRide;