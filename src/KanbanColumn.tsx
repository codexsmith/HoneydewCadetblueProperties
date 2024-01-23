import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const KanbanColumn = ({ title }) => {

  return (
    <Box w="300px" bg="gray.200" p="4" m="2">
      <Text fontSize="xl" mb="4">{title}</Text>
      {/* Kanban cards will go here */}
    </Box>
  );
};

export default KanbanColumn;
