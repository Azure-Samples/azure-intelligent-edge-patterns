Credit goes to Micheleen Harris and MSR Asia for the models
See src/alpr for any work done by Julia

# lva-alpr
Repo for curbside pick-up demo using ALPR models in LVA platform.

## specification

Using a video from a single fixed camera, the solution will:
- identify a vehicle by its license plate (LP) from a stream of live video
- use the identity to retrieve an "order" associated with the identity
- display the order along with supporting information about the vehicle (e.g., the LP, an image of the vehice)
- the solution should identify a vehicle within 3 seconds

We are making the following assumptions:
- daytime lighting conditions
- car pulls into a specific, monitored parking spot (one of two)
- the car LP exists in the system and is unique (i.e. state is not identified at this time)

### design

The solution will ingest video using LVA. It will pass frames to a model running on the same edge device as LVA.
When a LP is detected, the detection event flows through the associated IoT Hub and is processed by Stream Analytics.

The event will contain:
- the LP
- timestamp
- bounding box

Stream Analytics will aggregate events and update a store (Table storage?) when a vehicle is determined to present.
A simple web app  will monitor the store. When a vehicle is present the web app will display an "order" association with the vehcile.

NOTE: We don't really need to store and retrieve orders. This can be faked in the web app.

Instead of Stream Analytics, we could substitue a simple controller app that maintains a dictionary of LPs that it has seen. Every time an event is recive we touch the entry. The entries could time-out when it has received a touch after a certain period (20 seconds?). We should research if Stream Analytics will be a faster approach.