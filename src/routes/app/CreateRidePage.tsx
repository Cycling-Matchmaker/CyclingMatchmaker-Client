import React, { useState } from 'react';
import GpxMap from '../GpxMap';
import { useMutation, gql } from '@apollo/client';

const CreateRidePage = () => {
  // Use state to manage form input values
  const [rideName, setRideName] = useState('Test Ride');
  const [rideDate, setRideDate] = useState('2024-03-05T12:00');
  const [bikeType, setBikeType] = useState('Road');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [wattsPerKilo, setWattsPerKilo] = useState(3.5);
  const [intensity, setIntensity] = useState('Moderate');
  const [points, setPoints] = useState(['point1', 'point2']);
  const [elevation, setElevation] = useState(100);
  const [grade, setGrade] = useState('5%');
  const [terrain, setTerrain] = useState('Hilly');
  const [distance, setDistance] = useState(20);
  const [maxElevation, setMaxElevation] = useState(150);
  const [minElevation, setMinElevation] = useState(50);
  const [totalElevationGain, setTotalElevationGain] = useState(100);
  const [startCoordinates, setStartCoordinates] = useState([40.7128, -74.0060]);
  const [endCoordinates, setEndCoordinates] = useState([34.0522, -118.2437]);
  const [description, setDescription] = useState('Event description');

  // UseMutation hook for invoking the createEvent mutation
  const [createEventMutation, { loading }] = useMutation(CREATE_EVENT_MUTATION);

  // Handle form submission
  const handleCreateRide = async () => {
    try {
      // Create a payload with placeholder values
      const payload = {
        host: 'HOST_USERNAME',
        name: rideName,
        startTime: '2024-03-05T12:00:00',
        bikeType: bikeType,
        difficulty: difficulty,
        wattsPerKilo: wattsPerKilo,
        intensity: intensity,
        points: points,
        elevation: elevation,
        grade: grade,
        terrain: terrain,
        distance: distance,
        maxElevation: maxElevation,
        minElevation: minElevation,
        totalElevationGain: totalElevationGain,
        startCoordinates: startCoordinates,
        endCoordinates: endCoordinates,
        description: description,
        // Add other properties here...
      };

      // Log the mutation payload for testing
      console.log('Mutation Payload:', payload);

      // Invoke the createEventMutation with the payload
      const { data } = await createEventMutation({
        variables: payload,
      });

      // Log the created event data
      console.log('Event created:', data.createEvent);

      // Handle success, e.g., redirect to event details page
    } catch (error) {
      // Log and handle errors
      console.error('Error creating event:', error);
    }
  };

  // JSX for the CreateRidePage component
  return (
    <div>
      <h1>Create Ride</h1>

      {/* Form inputs for ride details */}
      <div>
        <label>Ride Name</label>
        <input type="text" value={rideName} onChange={(e) => setRideName(e.target.value)} />
      </div>

      <div>
        <label>Ride Date</label>
        <input type="datetime-local" value={rideDate} onChange={(e) => setRideDate(e.target.value)} />
      </div>

      <div>
        <label>Bike Type</label>
        <input type="text" value={bikeType} onChange={(e) => setBikeType(e.target.value)} />
      </div>

      <div>
        <label>Difficulty</label>
        <input type="text" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
      </div>

      <div>
        <label>Watts Per Kilo</label>
        <input type="number" value={wattsPerKilo} onChange={(e) => setWattsPerKilo(parseFloat(e.target.value))} />
      </div>

      <div>
        
      </div>

      {/* Add input fields for other event properties... */}
      
      {/* GpxMap component for selecting route on a map */}
      <div>
        <GpxMap />
      </div>

      {/* Button to submit the form */}
      <button onClick={handleCreateRide} disabled={loading}>
        {loading ? 'Creating Ride...' : 'Create Ride'}
      </button>
    </div>
  );
};

// GraphQL mutation for creating an event
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
    $points: [String!]!
    $elevation: Float!
    $grade: String!
    $terrain: String!
    $distance: Float!
    $maxElevation: Float!
    $minElevation: Float!
    $totalElevationGain: Float!
    $startCoordinates: [Float!]!
    $endCoordinates: [Float!]!
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
      name
      startTime
    }
  }
`;

// Export the CreateRidePage component
export default CreateRidePage;
