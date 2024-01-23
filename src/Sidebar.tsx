import React, { useState } from 'react';
import {
  Box, List, ListItem, Link as ChakraLink, IconButton, Flex, Input, Text, Spacer,
  useDisclosure, Popover, PopoverTrigger, PopoverContent, PopoverBody
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { HamburgerIcon, ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleCollapse = () => setCollapsed(!collapsed);

  // Function to render navigation links
  const renderNavLinks = () => (
    <List spacing={3}>
      <ListItem><ChakraLink as={Link} to="/explore">Explore</ChakraLink></ListItem>
      <ListItem><ChakraLink as={Link} to="/plan">Plan</ChakraLink></ListItem>
      <ListItem><ChakraLink as={Link} to="/settings">Settings</ChakraLink></ListItem>
    </List>
  );

  return (
    <Box w={collapsed ? "50px" : "200px"} bg="blue.500" color="white" p="4" h="100vh">
      <Flex direction="column" h="100%" align={collapsed ? "center" : "flex-start"}>
        {collapsed ? (
          <>
            <div>P</div>
            <Popover isOpen={isOpen} onClose={onClose} placement="right">
              <PopoverTrigger>
                <IconButton
                  icon={<HamburgerIcon />}
                  aria-label="Menu"
                  onClick={onOpen}
                  size="sm"
                  mt="2"
                />
              </PopoverTrigger>
              <PopoverContent color="white" bg="blue.500" borderColor="blue.500">
                <PopoverBody>
                  {renderNavLinks()}
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Spacer />
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label="Open"
              onClick={toggleCollapse}
              size="sm"
              mb="2"
            />
          </>
        ) : (
          <>
            <Text fontSize="lg" fontFamily="'Roboto Mono', monospace" mt="4" mb="2">
              Projectr
            </Text>
            <Input placeholder="Search..." mt="2" mb="4" />
            {renderNavLinks()}
            <Spacer />
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Close"
              onClick={toggleCollapse}
              alignSelf="flex-end"
              mt="auto"
              size="sm"
            />
          </>
        )}
      </Flex>
    </Box>
  );
}

export default Sidebar;
