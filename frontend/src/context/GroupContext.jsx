import React, { createContext, useState, useContext, useCallback } from 'react';
import API from '../services/api';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [currentGroupData, setCurrentGroupData] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const { data } = await API.get('/groups');
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchGroupDetails = useCallback(async (groupId) => {
    setLoadingDetails(true);
    try {
      const { data } = await API.get(`/groups/${groupId}`);
      setCurrentGroupData(data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const createGroup = async (groupData) => {
    const { data } = await API.post('/groups', groupData);
    setGroups((prev) => [data, ...prev]);
    return data;
  };

  const addGroupMember = async (groupId, email) => {
    const { data } = await API.post(`/groups/${groupId}/members`, { email });
    await fetchGroupDetails(groupId);
    return data;
  };

  const removeGroupMember = async (groupId, memberId) => {
    await API.delete(`/groups/${groupId}/members/${memberId}`);
    await fetchGroupDetails(groupId);
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroupData,
        loadingGroups,
        loadingDetails,
        fetchGroups,
        fetchGroupDetails,
        createGroup,
        addGroupMember,
        removeGroupMember
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => useContext(GroupContext);