import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from "./util";
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import './App.css';
import "./InfoBox.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  // data for individual country
  const [countryInfo, setCountryInfo] = useState({});
  // table data
  const [tableData, setTableData] = useState([]);
  // map data
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  // 
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      })
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country, // United States, United Kingdom, India
              value: country.countryInfo.iso2 // USA, UK, IN, FR
            }
          ));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    console.log("yoooo>>>>", countryCode);
    setCountry(countryCode);

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // set input field
        setCountry(countryCode);
        // All data... from country response
        setCountryInfo(data);

        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  console.log("COUNTRY INFO>>>", countryInfo);

  return (
    <div className="app">

      <div className="app__left">
        {/* Header */}
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>

          {/* Title + Select input dropdown */}
          <FormControl className="app__dropdown">

            <Select variant="outlined" onChange={onCountryChange} value={country}>

              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Loop through all countries and show a drop down list of the options */}

              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

            </Select>

          </FormControl>
        </div>

        {/* InfoBoxes */}
        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            className="infoBox__cases"
            onClick={(e) => setCasesType('cases')}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox
            active={casesType === "recovered"}
            className="infoBox__recovered"
            onClick={(e) => setCasesType('recovered')}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox
            isRed
            active={casesType === "deaths"}
            className="infoBox__deaths"
            onClick={(e) => setCasesType('deaths')}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)} />
        </div>

        {/* Map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          {/* Table */}
          <h3>Live cases by country</h3>
          <Table countries={tableData} />
          {/* Graph */}
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>

    </div>
  );
}

export default App;
