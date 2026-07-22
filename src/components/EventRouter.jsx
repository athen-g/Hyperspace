import { useParams } from "react-router-dom";

import EventPageTemplate from "./EventPageTemplate";
import EventOngoingTemplate from "./EventsOngoingTemplate";

import { EVENTS } from "../../constants";
import { eventsOngoing } from "../../constants/events";

export default function EventRouter() {
    const { slug } = useParams();

    const ongoingEvent = eventsOngoing.find(
        e => e.slug === slug
    );


    if (ongoingEvent) {
        return <EventOngoingTemplate />;
    }

    const event = EVENTS.find(
        e => e.slug === slug
    );

    if (event) {
        return <EventPageTemplate />;
    }

    return <h1>404 - Event Not Found</h1>;
}