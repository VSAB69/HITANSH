import React, { useEffect, useState } from "react";
import { get_todos } from "../api/endpoints";
import { useAuth } from "../context/useAuth";
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from "@mui/material";

const Menu = () => {
  const [notes, setNotes] = useState([]);
  const { user, logoutUser } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await get_todos();
      setNotes(data);
    };
    fetchNotes();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#f7f9fc",
        minHeight: "90vh",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        color="primary"
        sx={{ mb: 4 }}
      >
        Welcome {user ? user.username : "Guest"} 👋
      </Typography>

      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 2,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <List>
          {notes.map((note, index) => (
            <React.Fragment key={note.id}>
              <ListItem>
                <ListItemText
                  primary={note.name}
                  primaryTypographyProps={{
                    fontSize: 18,
                    fontWeight: 500,
                  }}
                />
              </ListItem>
              {index < notes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {notes.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 2, textAlign: "center" }}
            >
              No notes available.
            </Typography>
          )}
        </List>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: "bold",
            px: 3,
          }}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

export default Menu;
