import Event from "../models/Event.js";

// GET ALL EVENTS
export const getallEvents = async (req, res) => {
  try {
    const filters = {};
    if (req.query.search) {
      const search = req.query.search.trim();
      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }
    }
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.location) {
      filters.location = req.query.location;
    }
    if (req.query.ticketPrice) {
      filters.ticketPrice = { $lte: req.query.ticketPrice };
    }
    const events = await Event.find(filters);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET EVENT BY ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      imageUrl,
    } = req.body;
    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      availableSeats: totalSeats,
      imageUrl,
      createdBy: req.user._id,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      totalSeats,
      ticketPrice,
      imageUrl,
    } = req.body;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        ticketPrice,
        imageUrl,
      },
      { new: true },
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
