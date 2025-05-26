# RecipeGPT
The second iteration of RecipeGPT, this time built for the web which will also be expanded to mobile

## Team

- Mohamad-Mario Sakka - mohamad.mario.sakka@gmail.com
- Essam Al-Khalidy - essam.al@stud.fils.upb.ro
- Azzam Zafar - azzam.zafar03@gmail.com

## Idea Behind the Project

A web app that allows users to generate recipes based on queries they input, using OpenAI's API the web server can send such requests to chatgpt, then return them in
JSON format predefined by us. Users have to create accounts in order to be able to save the recipes on the database and also share them with others. They can also ask for live assistance
from a chatbot if they're trying to follow a recipe and get stuck. (small chance of implementing this too: the app will provide users with links from where they can buy the ingredients
necessary for the recipe from close stores)

## Technical Details

### Backend

- Built with SpringBoot, it handles authentication and authorization using Spring Security features
- Composed of Controllers, Services, Models, Repositories and Config Files
- Data is saved on a Firestore DB
- Implemented some unit tests with mock API functions
- Deployed to Google Cloud Platform through GitHub Workflows

### Frontend

- A ReactJS app built with Vite
- Components and pages are styled using tailwind-css
- Contains different reusable contexts and components throughout the app
- Deployed to Firebase Hosting using GitHub workflows

### Link to Figma:
https://www.figma.com/design/whY6YX4oTTjbNNhWwIZwUK/RecipeGPT-2.0?node-id=0-1&t=3FOK3AMgYEdsdd7U-1
