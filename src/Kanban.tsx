import React, { useContext } from 'react';
import { Flex } from '@chakra-ui/react';
import KanbanColumn from './KanbanColumn';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanContext } from './KanbanContext';


const Kanban = () => {
  const { kanbanData } = useContext(KanbanContext);

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex>
        {kanbanData.columns.map(column => (
          <KanbanColumn key={column.id} title={column.title} />
        ))}
      </Flex>
    </DndProvider>
  );
};

export default Kanban;
