let data = []
let filteredRecipes = []
let ingredientsTags = []
let appliancesTags = []
let ustensilsTags = []
let dropdowns = []
let dropdownsInput = []
let searchedTags = {
	ingredient: [],
	appliance: [],
	ustensil: [],
}

try {
	const response = await fetch('./data/recipes.json')
	data = await response.json()
	searchRecipes()
	searchbar.onkeydown = (event) => {
		if (event.code !== 'Enter' && event.code !== 'NumpadEnter') {
			return
		}
		searchRecipes()
	}
	searchicon.onclick = searchRecipes
	for (let child of filters.children) {
		for (let filter of child.children) {
			if (filter.id.includes('input')) {
				dropdownsInput.push(filter)
				filter.children[0].children[0].onkeydown = ({ code, target }) => {
					if (code !== 'Enter' && code !== 'NumpadEnter') {
						return
					}
					addTag(target.name, target.value)
					closeMenu({ target })
					target.value = ''
				}
				filter.children[0].children[1].onclick = closeMenu
			} else {
				dropdowns.push(filter)
				filter.onclick = openMenu
			}
		}
	}
} catch (error) {
	console.error(error.message)
	errorDiv.textContent = 'Erreur lors de la récupération des recettes.'
	errorDiv.style.display = 'inherit'
}

function displayRecipes() {
	recipes.innerHTML = ''

	if (!filteredRecipes.length) {
		recipes.style.gridTemplateRows = 'unset'
		errorDiv.textContent = 'Aucune recette à afficher.'
		errorDiv.style.display = 'inherit'
		return
	}

	if (!errorDiv.style.display || errorDiv.style.display !== 'none') {
		errorDiv.style.display = 'none'
	}

	recipes.style.gridTemplateRows = `repeat(${Math.ceil(filteredRecipes.length / 3)}, 365px)`

	const timerIcon = document.createElement('i')
	timerIcon.classList.add('fa-regular')
	timerIcon.classList.add('fa-clock')

	for (const recipe of filteredRecipes) {
		const recipeDiv = document.createElement('div')
		const recipeImg = document.createElement('div')
		const recipeContent = document.createElement('div')
		const recipeTop = document.createElement('div')
		const recipeTitle = document.createElement('h2')
		const recipeTimeDiv = document.createElement('div')
		const recipeTimeText = document.createElement('span')
		const recipeBottom = document.createElement('div')
		const recipeIngredients = document.createElement('div')
		const recipeDescriptionDiv = document.createElement('div')
		const recipeDescription = document.createElement('p')

		recipeDiv.classList.add('recipe')
		recipeTitle.textContent = recipe.name
		recipeTimeDiv.classList.add('time')
		recipeTimeText.textContent = recipe.time + ' min'
		recipe.ingredients.forEach((ing) => {
			const ingredient = document.createElement('p')
			const name = document.createElement('span')
			const quantity = document.createElement('span')

			ingredient.classList.add('ingredient')
			name.classList.add('name')
			name.textContent = ing.ingredient + ': '
			quantity.textContent = ing.unit ? `${ing.quantity} ${ing.unit}` : ing.quantity

			recipeIngredients.appendChild(ingredient)
			ingredient.appendChild(name)
			ingredient.appendChild(quantity)
		})
		recipeDescription.classList.add('description')
		recipeDescription.textContent = recipe.description

		recipes.appendChild(recipeDiv)
		recipeDiv.appendChild(recipeImg)
		recipeDiv.appendChild(recipeContent)
		recipeContent.appendChild(recipeTop)
		recipeContent.appendChild(recipeBottom)
		recipeTop.appendChild(recipeTitle)
		recipeTop.appendChild(recipeTimeDiv)
		recipeTimeDiv.appendChild(timerIcon.cloneNode())
		recipeTimeDiv.appendChild(recipeTimeText)
		recipeBottom.appendChild(recipeIngredients)
		recipeBottom.appendChild(recipeDescriptionDiv)
		recipeDescriptionDiv.appendChild(recipeDescription)
	}
	updateTags()
}

function searchRecipes() {
	const search = searchbar.value.toLowerCase()
	if (!search || !search.length) {
		filteredRecipes = [...data]
	} else {
		filteredRecipes = data.filter((recipe) => recipe.name.toLowerCase().includes(search) || recipe.ingredients.find((ing) => ing.ingredient.toLowerCase().includes(search)) || recipe.description.toLowerCase().includes(search))
	}
	searchRecipesWithTags()
}

function updateTags() {
	ingredientsTags = [...new Set(filteredRecipes.map((recipe) => recipe.ingredients))]
	ingredientsTags = [...new Set(ingredientsTags.map(([{ ingredient }]) => ingredient))].sort((a, b) => a.localeCompare(b))
	appliancesTags = [...new Set(filteredRecipes.map((recipe) => recipe.appliance))].map((appliance) => appliance).sort((a, b) => a.localeCompare(b))
	ustensilsTags = [...new Set(filteredRecipes.map((recipe) => recipe.ustensils))]
	ustensilsTags = [...new Set(ustensilsTags.map(([ustensil]) => ustensil))].sort((a, b) => a.localeCompare(b))

	ingredients_list.innerHTML = ''
	appliances_list.innerHTML = ''
	ustensils_list.innerHTML = ''
	ingredientsTags.forEach((ingredient) => {
		const ingredientElement = document.createElement('p')
		ingredientElement.textContent = ingredient
		ingredientElement.onclick = () => {
			addTag('ingredient', ingredient)
			closeMenu({ target: ingredients_input })
		}
		ingredients_list.appendChild(ingredientElement)
	})
	appliancesTags.forEach((appliance) => {
		const applianceElement = document.createElement('p')
		applianceElement.textContent = appliance
		applianceElement.onclick = () => {
			addTag('appliance', appliance)
			closeMenu({ target: appliances_input })
		}
		appliances_list.appendChild(applianceElement)
	})
	ustensilsTags.forEach((ustensil) => {
		const ustensilElement = document.createElement('p')
		ustensilElement.textContent = ustensil
		ustensilElement.onclick = () => {
			addTag('ustensil', ustensil)
			closeMenu({ target: ustensils_input })
		}
		ustensils_list.appendChild(ustensilElement)
	})
}

function openMenu({ target }) {
	if (!target.id) {
		target = target.closest('div')
	}

	dropdowns.forEach((menu) => (menu.id === target.id ? (menu.style.display = 'none') : (menu.style.display = 'block')))
	dropdownsInput.forEach((menu) => {
		if (menu.id.includes(target.id)) {
			menu.style.display = 'block'
			menu.parentNode.style.width = menu.getBoundingClientRect().width + 'px'
		} else {
			menu.style.display = 'none'
			menu.parentNode.style.width = 'unset'
		}
	})
}

function closeMenu({ target }) {
	if (!target.id) {
		target = target.closest('div').parentNode
	}

	dropdownsInput.forEach((menu) => (menu.id === target.id ? (menu.style.display = 'none') : null))
	dropdowns.forEach((menu) => (menu.id === target.id.split('_').shift() ? (menu.style.display = 'block') : null))
	const closedMenu = dropdownsInput.find((menu) => menu.id === target.id)
	closedMenu.parentNode.style.width = 'unset'
}

function addTag(name, value) {
	searchedTags[name].push(value.toLowerCase())

	const newTag = document.createElement('div')
	const tagName = document.createElement('span')
	const removeTag = document.createElement('i')

	newTag.classList.add('tag')
	newTag.classList.add(name)
	tagName.textContent = value
	removeTag.classList.add('fa-regular')
	removeTag.classList.add('fa-circle-xmark')
	removeTag.onclick = () => {
		searchedTags[name].splice(searchedTags[name].indexOf(value.toLowerCase()), 1)
		newTag.remove()
		searchRecipes()
	}

	tags.appendChild(newTag)
	newTag.appendChild(tagName)
	newTag.appendChild(removeTag)

	searchRecipes()
}

function searchRecipesWithTags() {
	if (!searchedTags.ingredient.length && !searchedTags.appliance.length && !searchedTags.ustensil.length) {
		return displayRecipes()
	} else {
		filteredRecipes = filteredRecipes.filter((recipe) => (!searchedTags.ingredient.length || recipe.ingredients.find((ingredient) => searchedTags.ingredient.includes(ingredient.ingredient.toLowerCase()))) && (!searchedTags.appliance.length || searchedTags.appliance.includes(recipe.appliance.toLowerCase())) && (!searchedTags.ustensil.length || recipe.ustensils.find((ustensil) => searchedTags.ustensil.includes(ustensil.toLowerCase()))))
	}
	displayRecipes()
}
