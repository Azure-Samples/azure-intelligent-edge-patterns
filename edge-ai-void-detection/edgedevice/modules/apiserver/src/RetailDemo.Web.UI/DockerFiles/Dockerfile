FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["RetailDemo.Web.UI/RetailDemo.Web.UI.csproj", "RetailDemo.Web.UI/"]
RUN dotnet restore "RetailDemo.Web.UI/RetailDemo.Web.UI.csproj"
COPY . .
WORKDIR "/src/RetailDemo.Web.UI"
RUN dotnet build "RetailDemo.Web.UI.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "RetailDemo.Web.UI.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "RetailDemo.Web.UI.dll"]