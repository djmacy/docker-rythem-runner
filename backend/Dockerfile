# .NET Dockerfile

# Base runtime image for running the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5245

# Build stage: includes SDK for building and publishing the project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["SpotifyRunnerApp.csproj", "./"]
RUN dotnet restore "SpotifyRunnerApp.csproj"

# Copy the entire project and build it
COPY . .
RUN dotnet publish "SpotifyRunnerApp.csproj" -c Release -o /app/publish

# Final runtime image
FROM base AS final
WORKDIR /app

# Copy files from the build stage to the runtime stage
COPY --from=build /app/publish .

# Set the entrypoint for the container
ENTRYPOINT ["dotnet", "SpotifyRunnerApp.dll"]
