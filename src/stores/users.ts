/*
    Copyright (C) 2026 Florian MAZEN

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {defineStore} from 'pinia'
import {useAxiosStore} from "@/stores/Axios";
import {useAuthentStore} from "@/stores/authent";
import type {CreateUserRequest, UpdateUserRequest, User} from "@/components/settings/admin/User";

export const useUsersStore = defineStore('users', {
  state: () => {
    return {axiosStore: useAxiosStore(), authentStore: useAuthentStore()}
  },
  actions: {
    async getUsers(): Promise<User[]> {
      return this.axiosStore.axios
        .get<User[]>(this.authentStore.authenticationUrl("/users"))
        .then((response) => response.data);
    },
    async getUser(id: string): Promise<User> {
      return this.axiosStore.axios
        .get<User>(this.authentStore.authenticationUrl(`/users/${id}`))
        .then((response) => response.data);
    },
    async createUser(request: CreateUserRequest): Promise<User> {
      return this.axiosStore.axios
        .post<User>(this.authentStore.authenticationUrl("/users"), request)
        .then((response) => response.data);
    },
    async updateUser(id: string, request: UpdateUserRequest): Promise<User> {
      return this.axiosStore.axios
        .put<User>(this.authentStore.authenticationUrl(`/users/${id}`), request)
        .then((response) => response.data);
    },
    async deleteUser(id: string): Promise<void> {
      await this.axiosStore.axios
        .delete(this.authentStore.authenticationUrl(`/users/${id}`));
    },
  },
})
