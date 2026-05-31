// 1er snippet
			import {defineStore} from 'pinia'
			export const useStoreNameStore = defineStore('StoreName', () => {
				//State
	
	
	
	
				 //getters
	
	
	
				 // actions
	
				return {
					
				}
			});

			 // snippet Second

				import {defineStore} from 'pinia'
				import {ref, computed} from 'vue'
			
					export const useStoreNameStore = defineStore('StoreName', () => {
						//State
						const state = ref({4:'null'})
			
						 // Computed Methods
						const computedValue = computed (() => {
							return state.value
						})
			
						 // Actions
						const actionName = computed ( () => {
							
						})
						 
			
			
						return {
							state,
							computedValue,
							actionName
						}
			
					});